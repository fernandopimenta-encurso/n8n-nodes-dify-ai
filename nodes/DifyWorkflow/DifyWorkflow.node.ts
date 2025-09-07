import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

import {
	executeWorkflow,
	getWorkflowDetails,
	stopWorkflow,
	getWorkflowLogs,
} from './DifyWorkflowOperations';

import { workflowOperations, workflowFields } from './descriptions/WorkflowDescription';

export class DifyWorkflow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dify Workflow',
		name: 'difyWorkflow',
		icon: 'file:dify.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Execute and manage Dify AI workflows with streaming and blocking modes',
		defaults: {
			name: 'Dify Workflow',
		},
		inputs: [
			{
				displayName: '',
				type: NodeConnectionType.Main,
			},
		],
		outputs: [
			{
				displayName: '',
				type: NodeConnectionType.Main,
			},
		],
		credentials: [
			{
				name: 'difyApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'hidden',
				default: 'workflow',
				noDataExpression: true,
			},
			...workflowOperations,
			...workflowFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let returnData: INodeExecutionData[] = [];

		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: INodeExecutionData[];

				switch (operation) {
					case 'execute':
						responseData = await executeWorkflow.call(this, i);
						break;

					case 'getDetails':
						responseData = await getWorkflowDetails.call(this, i);
						break;

					case 'stop':
						responseData = await stopWorkflow.call(this, i);
						break;

					case 'getLogs':
						responseData = await getWorkflowLogs.call(this, i);
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported`,
							{ itemIndex: i },
						);
				}

				// Add all response data to return data
				returnData.push(...responseData);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							operation,
							timestamp: Date.now(),
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}