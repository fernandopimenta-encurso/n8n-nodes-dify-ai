import type { INodeProperties } from 'n8n-workflow';

export const resource: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Chat',
			value: 'chat',
			description: 'Chat with AI assistant and manage conversations',
		},
		{
			name: 'Completion',
			value: 'completion',
			description: 'Generate text completions using AI models',
		},
		{
			name: 'Feedback',
			value: 'feedback',
			description: 'Provide feedback on AI responses to improve performance',
		},
	],
	default: 'chat',
};

// Common fields that might be reused across operations
export const commonFields: INodeProperties[] = [
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['chat', 'completion'],
				operation: ['send', 'create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Timeout (Seconds)',
				name: 'timeout',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 300,
				},
				default: 30,
				description: 'Maximum time to wait for a response from Dify API',
			},
			{
				displayName: 'Include Usage Stats',
				name: 'includeUsage',
				type: 'boolean',
				default: false,
				description: 'Whether to include token usage and cost information in the response',
			},
			{
				displayName: 'Include Retriever Resources',
				name: 'includeRetrieverResources',
				type: 'boolean',
				default: false,
				description: 'Whether to include knowledge base retrieval information in the response',
			},
		],
	},
];

// Validation helpers
export const validateMessageId = (messageId: string): boolean => {
	return /^msg-[a-zA-Z0-9-]+$/.test(messageId);
};

export const validateConversationId = (conversationId: string): boolean => {
	return /^[a-zA-Z0-9-]+$/.test(conversationId);
};

export const validateTaskId = (taskId: string): boolean => {
	return /^task-[a-zA-Z0-9-]+$/.test(taskId);
};