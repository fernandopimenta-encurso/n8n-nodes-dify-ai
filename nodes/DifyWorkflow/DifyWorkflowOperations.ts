import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

import {
	difyApiRequest,
	handleStreamResponse,
	extractFileInfo,
	validateFileUpload,
	parseSSEStream,
	retryApiRequest,
} from '../../utils/GenericFunctions';

import { validateTaskId } from '../Dify/descriptions/shared';

import type {
	IWorkflowExecuteRequest,
	IWorkflowExecuteResponse,
	IWorkflowStreamResponse,
	IWorkflowRunDetails,
	IWorkflowLogResponse,
	IMessageFile,
} from '../../utils/types';

/**
 * Execute a workflow with input parameters
 */
export async function executeWorkflow(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const inputs = this.getNodeParameter('inputs', itemIndex, {}) as IDataObject;
	const responseMode = this.getNodeParameter('responseMode', itemIndex, 'blocking') as string;
	const user = this.getNodeParameter('user', itemIndex, '') as string;
	const binaryProperty = this.getNodeParameter('binaryProperty', itemIndex, '') as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;

	// Validate inputs
	if (!inputs || Object.keys(inputs).length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'Workflow inputs are required',
			{ itemIndex },
		);
	}

	let files: IMessageFile[] = [];

	// Handle file uploads if binary property is specified
	if (binaryProperty) {
		const binaryData = this.helpers.assertBinaryData(itemIndex, binaryProperty);
		const maxFiles = (additionalOptions.maxFiles as number) || 5;

		if (Array.isArray(binaryData)) {
			// Multiple files
			for (let i = 0; i < Math.min(binaryData.length, maxFiles); i++) {
				const fileInfo = extractFileInfo(binaryData[i]);
				
				// Validate file
				const validation = validateFileUpload(fileInfo);
				if (!validation.valid) {
					throw new NodeOperationError(
						this.getNode(),
						`File validation failed: ${validation.error}`,
						{ itemIndex },
					);
				}

				files.push({
					id: `file_${i}`,
					type: fileInfo.mimeType.startsWith('image/') ? 'image' : 'document',
					name: fileInfo.name,
					size: fileInfo.size,
				});
			}
		} else {
			// Single file
			const fileInfo = extractFileInfo(binaryData);
			
			// Validate file
			const validation = validateFileUpload(fileInfo);
			if (!validation.valid) {
				throw new NodeOperationError(
					this.getNode(),
					`File validation failed: ${validation.error}`,
					{ itemIndex },
				);
			}

			files.push({
				id: 'file_0',
				type: fileInfo.mimeType.startsWith('image/') ? 'image' : 'document',
				name: fileInfo.name,
				size: fileInfo.size,
			});
		}
	}

	const requestBody: IWorkflowExecuteRequest = {
		inputs,
		response_mode: responseMode as 'streaming' | 'blocking',
		...(user && { user }),
		...(files.length > 0 && { files }),
	};

	const timeout = (additionalOptions.timeout as number) || 60;

	if (responseMode === 'streaming') {
		return await handleWorkflowStreaming.call(this, requestBody, additionalOptions, itemIndex);
	} else {
		return await handleWorkflowBlocking.call(this, requestBody, timeout, additionalOptions, itemIndex);
	}
}

/**
 * Handle streaming workflow execution
 */
async function handleWorkflowStreaming(
	this: IExecuteFunctions,
	requestBody: IWorkflowExecuteRequest,
	additionalOptions: IDataObject,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const returnIntermediateResults = additionalOptions.returnIntermediateResults as boolean || false;

	let finalResult: any = null;
	let workflowRunId = '';
	let taskId = '';

	await handleStreamResponse.call(
		this,
		{
			method: 'POST',
			endpoint: '/workflows/run',
			body: requestBody,
		},
		(chunk: string) => {
			const events = parseSSEStream(chunk);
			
			for (const event of events) {
				const streamResponse = event as IWorkflowStreamResponse;
				
				if (streamResponse.task_id) {
					taskId = streamResponse.task_id;
				}
				
				if (streamResponse.workflow_run_id) {
					workflowRunId = streamResponse.workflow_run_id;
				}

				if (streamResponse.event === 'workflow_started') {
					// Workflow has started
					if (returnIntermediateResults) {
						returnData.push({
							json: {
								event: 'workflow_started',
								workflow_run_id: workflowRunId,
								task_id: taskId,
								timestamp: Date.now(),
							},
							pairedItem: { item: itemIndex },
						});
					}
				} else if (streamResponse.event === 'node_started' || streamResponse.event === 'node_finished') {
					// Node execution events
					if (returnIntermediateResults && streamResponse.data) {
						returnData.push({
							json: {
								event: streamResponse.event,
								workflow_run_id: workflowRunId,
								node_data: streamResponse.data,
								timestamp: Date.now(),
							},
							pairedItem: { item: itemIndex },
						});
					}
				} else if (streamResponse.event === 'workflow_finished') {
					// Workflow completed
					finalResult = {
						event: 'workflow_finished',
						workflow_run_id: workflowRunId,
						task_id: taskId,
						data: streamResponse.data,
						message_id: streamResponse.message_id,
						created_at: streamResponse.created_at,
					};
				} else if (streamResponse.event === 'error') {
					throw new NodeOperationError(
						this.getNode(),
						`Workflow execution failed: ${streamResponse.data?.error || 'Unknown error'}`,
						{ itemIndex },
					);
				}
			}
		},
	);

	// Add final result
	if (finalResult) {
		returnData.push({
			json: finalResult,
			pairedItem: { item: itemIndex },
		});
	}

	return returnData.length > 0 ? returnData : [{
		json: {
			workflow_run_id: workflowRunId,
			task_id: taskId,
			status: 'completed',
			timestamp: Date.now(),
		},
		pairedItem: { item: itemIndex },
	}];
}

/**
 * Handle blocking workflow execution
 */
async function handleWorkflowBlocking(
	this: IExecuteFunctions,
	requestBody: IWorkflowExecuteRequest,
	timeout: number,
	additionalOptions: IDataObject,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const pollInterval = (additionalOptions.pollInterval as number) || 2;
	const includeUsage = additionalOptions.includeUsage as boolean || false;
	const includeMetadata = additionalOptions.includeMetadata as boolean || false;

	// Start workflow execution
	const executeResponse = await retryApiRequest(async () => {
		return await difyApiRequest.call(this, {
			method: 'POST',
			endpoint: '/workflows/run',
			body: requestBody,
			timeout: timeout * 1000,
		});
	}) as IWorkflowExecuteResponse;

	if (!executeResponse.workflow_run_id) {
		throw new NodeOperationError(
			this.getNode(),
			'Failed to start workflow execution',
			{ itemIndex },
		);
	}

	const workflowRunId = executeResponse.workflow_run_id;
	const startTime = Date.now();

	// Poll for completion
	while (true) {
		// Check timeout
		if (Date.now() - startTime > timeout * 1000) {
			throw new NodeOperationError(
				this.getNode(),
				`Workflow execution timed out after ${timeout} seconds`,
				{ itemIndex },
			);
		}

		// Get workflow run details
		const details = await getWorkflowRunDetails.call(this, workflowRunId);

		if (details.status === 'succeeded' || details.status === 'failed' || details.status === 'stopped') {
			// Workflow completed
			const result: IDataObject = {
				workflow_run_id: workflowRunId,
				status: details.status,
				inputs: details.inputs,
				outputs: details.outputs || {},
				elapsed_time: details.elapsed_time,
				total_steps: details.total_steps,
				created_at: details.created_at,
				finished_at: details.finished_at,
			};

			if (details.error) {
				result.error = details.error;
			}

			if (includeUsage && details.total_tokens) {
				result.usage = {
					total_tokens: details.total_tokens,
				};
			}

			if (includeMetadata) {
				result.metadata = {
					execution_time_ms: Date.now() - startTime,
					poll_interval: pollInterval,
				};
			}

			if (details.status === 'failed') {
				throw new NodeOperationError(
					this.getNode(),
					`Workflow execution failed: ${details.error || 'Unknown error'}`,
					{ itemIndex },
				);
			}

			return [{
				json: result,
				pairedItem: { item: itemIndex },
			}];
		}

		// Wait before next poll
		await new Promise(resolve => setTimeout(resolve, pollInterval * 1000));
	}
}

/**
 * Get workflow run details
 */
export async function getWorkflowDetails(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const workflowRunId = this.getNodeParameter('workflowRunId', itemIndex) as string;

	if (!workflowRunId) {
		throw new NodeOperationError(
			this.getNode(),
			'Workflow Run ID is required',
			{ itemIndex },
		);
	}

	const details = await getWorkflowRunDetails.call(this, workflowRunId);

	return [{
		json: details,
		pairedItem: { item: itemIndex },
	}];
}

/**
 * Stop workflow execution
 */
export async function stopWorkflow(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const taskId = this.getNodeParameter('taskId', itemIndex) as string;

	if (!taskId) {
		throw new NodeOperationError(
			this.getNode(),
			'Task ID is required',
			{ itemIndex },
		);
	}

	if (!validateTaskId(taskId)) {
		throw new NodeOperationError(
			this.getNode(),
			'Invalid task ID format. Task ID should start with "task-"',
			{ itemIndex },
		);
	}

	const response = await retryApiRequest(async () => {
		return await difyApiRequest.call(this, {
			method: 'POST',
			endpoint: `/workflows/tasks/${taskId}/stop`,
		});
	});

	return [{
		json: {
			task_id: taskId,
			result: response.result || 'success',
			message: 'Workflow execution stopped successfully',
			timestamp: Date.now(),
		},
		pairedItem: { item: itemIndex },
	}];
}

/**
 * Get workflow execution logs
 */
export async function getWorkflowLogs(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const workflowRunId = this.getNodeParameter('workflowRunId', itemIndex) as string;

	if (!workflowRunId) {
		throw new NodeOperationError(
			this.getNode(),
			'Workflow Run ID is required',
			{ itemIndex },
		);
	}

	const response = await retryApiRequest(async () => {
		return await difyApiRequest.call(this, {
			method: 'GET',
			endpoint: `/workflows/run/${workflowRunId}/logs`,
		});
	}) as IWorkflowLogResponse;

	const logs = response.workflow_run_logs || [];

	// Return each log as a separate item
	return logs.map((log, index) => ({
		json: log,
		pairedItem: { item: itemIndex },
	}));
}

/**
 * Helper function to get workflow run details
 */
async function getWorkflowRunDetails(
	this: IExecuteFunctions,
	workflowRunId: string,
): Promise<IWorkflowRunDetails> {
	return await retryApiRequest(async () => {
		return await difyApiRequest.call(this, {
			method: 'GET',
			endpoint: `/workflows/run/${workflowRunId}`,
		});
	}) as IWorkflowRunDetails;
}