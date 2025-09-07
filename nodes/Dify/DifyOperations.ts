import type {
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

import {
	difyApiRequest,
	handleStreamResponse,
	sanitizeInput,
	validateFileUpload,
	extractFileInfo,
	prepareFileUpload,
	retryApiRequest,
} from '../../utils/GenericFunctions';

import type {
	IChatInputs,
	ICompletionInputs,
	IFeedback,
	IMessageFile,
} from '../../utils/types';

// Chat Operations
export async function sendChatMessage(context: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData | INodeExecutionData[]> {
	const query = context.getNodeParameter('query', itemIndex) as string;
	const responseMode = context.getNodeParameter('responseMode', itemIndex, 'blocking') as 'blocking' | 'streaming';
	const conversationId = context.getNodeParameter('conversationId', itemIndex, '') as string;
	const user = context.getNodeParameter('user', itemIndex, '') as string;
	const autoGenerateName = context.getNodeParameter('autoGenerateName', itemIndex, true) as boolean;
	
	// Process inputs
	const inputsCollection = context.getNodeParameter('inputs.inputsValues', itemIndex, []) as Array<{key: string, value: string}>;
	const inputs: IDataObject = {};
	for (const input of inputsCollection) {
		if (input.key && input.value) {
			inputs[input.key] = input.value;
		}
	}

	// Process files
	const filesCollection = context.getNodeParameter('files.filesValues', itemIndex, []) as Array<{inputDataFieldName: string, type: string}>;
	const messageFiles: IMessageFile[] = [];

	for (const fileConfig of filesCollection) {
		const binaryPropertyName = fileConfig.inputDataFieldName || 'data';
		const binaryData = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		
		const fileInfo = extractFileInfo(binaryData);
		const validation = validateFileUpload(fileInfo);
		
		if (!validation.valid) {
			throw new NodeOperationError(context.getNode(), validation.error!, { itemIndex });
		}

		// Upload file first
		const uploadResponse = await uploadFile(context, fileInfo);
		
		messageFiles.push({
			id: uploadResponse.id,
			type: fileConfig.type as 'image' | 'document' | 'audio' | 'video',
			name: fileInfo.name,
			url: uploadResponse.url,
			size: fileInfo.size,
		});
	}

	// Prepare request body
	const body: IChatInputs = sanitizeInput({
		query,
		inputs,
		response_mode: responseMode,
		user: user || undefined,
		auto_generate_name: autoGenerateName,
		conversation_id: conversationId || undefined,
		files: messageFiles.length > 0 ? messageFiles : undefined,
	});

	// Get additional options
	const additionalOptions = context.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;
	const timeout = (additionalOptions.timeout as number) * 1000 || 30000;

	if (responseMode === 'streaming') {
		return await handleStreamingChat(context, body, timeout, itemIndex);
	} else {
		const responseData = await retryApiRequest(async () => {
			return await difyApiRequest.call(context, {
				method: 'POST',
				endpoint: '/chat-messages',
				body,
				timeout,
			});
		});

		return {
			json: processResponse(responseData, additionalOptions),
			pairedItem: { item: itemIndex },
		};
	}
}

async function handleStreamingChat(context: IExecuteFunctions, body: IChatInputs, timeout: number, itemIndex: number): Promise<INodeExecutionData[]> {
	const streamResults: INodeExecutionData[] = [];
	let completeResponse = '';
	let currentData: any = {};

	await handleStreamResponse.call(context, {
		method: 'POST',
		endpoint: '/chat-messages',
		body,
		timeout,
	}, (chunk: any) => {
		if (chunk.event === 'message') {
			completeResponse += chunk.answer || '';
			currentData = { ...currentData, ...chunk };
			
			streamResults.push({
				json: {
					event: chunk.event,
					answer: chunk.answer,
					conversation_id: chunk.conversation_id,
					message_id: chunk.message_id,
					created_at: chunk.created_at,
					complete_response: completeResponse,
				},
				pairedItem: { item: itemIndex },
			});
		} else if (chunk.event === 'message_end') {
			currentData = { ...currentData, ...chunk };
			
			streamResults.push({
				json: {
					event: chunk.event,
					conversation_id: chunk.conversation_id,
					message_id: chunk.message_id,
					metadata: chunk.metadata,
					complete_response: completeResponse,
					final: true,
				},
				pairedItem: { item: itemIndex },
			});
		}
	});

	return streamResults;
}

export async function stopChatGeneration(context: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const taskId = context.getNodeParameter('taskId', itemIndex) as string;
	const user = context.getNodeParameter('user', itemIndex, '') as string;

	const body: IDataObject = {
		user: user || undefined,
	};

	const responseData = await difyApiRequest.call(context, {
		method: 'POST',
		endpoint: `/chat-messages/${taskId}/stop`,
		body,
	});

	return {
		success: true,
		task_id: taskId,
		...responseData,
	};
}

export async function getChatSuggestions(context: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const messageId = context.getNodeParameter('messageId', itemIndex) as string;
	const user = context.getNodeParameter('user', itemIndex, '') as string;

	const query: IDataObject = user ? { user } : {};

	const responseData = await difyApiRequest.call(context, {
		method: 'GET',
		endpoint: `/messages/${messageId}/suggested`,
		query,
	});

	return {
		message_id: messageId,
		suggestions: responseData.data || [],
	};
}

// Completion Operations
export async function createCompletion(context: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const inputsCollection = context.getNodeParameter('inputs.inputsValues', itemIndex, []) as Array<{key: string, value: string}>;
	const inputs: IDataObject = {};
	
	for (const input of inputsCollection) {
		if (input.key && input.value) {
			inputs[input.key] = input.value;
		}
	}

	if (Object.keys(inputs).length === 0) {
		throw new NodeOperationError(
			context.getNode(),
			'At least one input is required for text completion',
			{ itemIndex },
		);
	}

	const responseMode = context.getNodeParameter('responseMode', itemIndex, 'blocking') as 'blocking' | 'streaming';
	const user = context.getNodeParameter('user', itemIndex, '') as string;

	// Process files
	const filesCollection = context.getNodeParameter('files.filesValues', itemIndex, []) as Array<{inputDataFieldName: string, type: string}>;
	const messageFiles: IMessageFile[] = [];

	for (const fileConfig of filesCollection) {
		const binaryPropertyName = fileConfig.inputDataFieldName || 'data';
		const binaryData = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		
		const fileInfo = extractFileInfo(binaryData);
		const validation = validateFileUpload(fileInfo);
		
		if (!validation.valid) {
			throw new NodeOperationError(context.getNode(), validation.error!, { itemIndex });
		}

		// Upload file first
		const uploadResponse = await uploadFile(context, fileInfo);
		
		messageFiles.push({
			id: uploadResponse.id,
			type: fileConfig.type as 'image' | 'document' | 'audio' | 'video',
			name: fileInfo.name,
			url: uploadResponse.url,
			size: fileInfo.size,
		});
	}

	const body: ICompletionInputs = sanitizeInput({
		inputs,
		response_mode: responseMode,
		user: user || undefined,
		files: messageFiles.length > 0 ? messageFiles : undefined,
	});

	const additionalOptions = context.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;
	const timeout = (additionalOptions.timeout as number) * 1000 || 30000;

	const responseData = await retryApiRequest(async () => {
		return await difyApiRequest.call(context, {
			method: 'POST',
			endpoint: '/completion-messages',
			body,
			timeout,
		});
	});

	return processResponse(responseData, additionalOptions);
}

export async function stopCompletionGeneration(context: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const taskId = context.getNodeParameter('taskId', itemIndex) as string;
	const user = context.getNodeParameter('user', itemIndex, '') as string;

	const body: IDataObject = {
		user: user || undefined,
	};

	const responseData = await difyApiRequest.call(context, {
		method: 'POST',
		endpoint: `/completion-messages/${taskId}/stop`,
		body,
	});

	return {
		success: true,
		task_id: taskId,
		...responseData,
	};
}

// Feedback Operations
export async function submitFeedback(context: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const messageId = context.getNodeParameter('messageId', itemIndex) as string;
	const rating = context.getNodeParameter('rating', itemIndex) as 'like' | 'dislike';
	const content = context.getNodeParameter('content', itemIndex, '') as string;
	const user = context.getNodeParameter('user', itemIndex, '') as string;

	const body: IFeedback & IDataObject = sanitizeInput({
		rating,
		content: content || undefined,
		user: user || undefined,
	});

	const responseData = await difyApiRequest.call(context, {
		method: 'POST',
		endpoint: `/messages/${messageId}/feedbacks`,
		body,
	});

	return {
		success: true,
		message_id: messageId,
		rating,
		content,
		...responseData,
	};
}

// Utility Functions
export async function uploadFile(context: IExecuteFunctions, fileInfo: { name: string; data: Buffer; mimeType: string }): Promise<any> {
	const formData = prepareFileUpload([fileInfo]);

	const responseData = await difyApiRequest.call(context, {
		method: 'POST',
		endpoint: '/files/upload',
		body: formData,
		encoding: 'form',
	});

	return responseData;
}

export function processResponse(responseData: any, additionalOptions: IDataObject): IDataObject {
	const result: IDataObject = { ...responseData };

	// Handle metadata if it exists
	if (result.metadata && typeof result.metadata === 'object') {
		const metadata = result.metadata as IDataObject;

		// Include usage stats if requested
		if (!additionalOptions.includeUsage && metadata.usage) {
			delete metadata.usage;
		}

		// Include retriever resources if requested
		if (!additionalOptions.includeRetrieverResources && metadata.retriever_resources) {
			delete metadata.retriever_resources;
		}

		// Clean up metadata if empty
		if (Object.keys(metadata).length === 0) {
			delete result.metadata;
		}
	}

	return result;
}