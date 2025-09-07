import type { INodeProperties } from 'n8n-workflow';

export const chatOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['chat'],
			},
		},
		options: [
			{
				name: 'Send Message',
				value: 'send',
				description: 'Send a chat message to Dify and receive a response',
				action: 'Send a chat message',
			},
			{
				name: 'Stop Generation',
				value: 'stop',
				description: 'Stop an ongoing chat message generation',
				action: 'Stop chat message generation',
			},
			{
				name: 'Get Suggested Questions',
				value: 'getSuggestions',
				description: 'Get suggested follow-up questions for a conversation',
				action: 'Get suggested questions',
			},
		],
		default: 'send',
	},
];

export const chatFields: INodeProperties[] = [
	// Send Message Fields
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['send'],
			},
		},
		default: '',
		description: 'The user query/message to send to the AI assistant',
		placeholder: 'What is the weather today?',
	},
	{
		displayName: 'Response Mode',
		name: 'responseMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['send'],
			},
		},
		options: [
			{
				name: 'Blocking',
				value: 'blocking',
				description: 'Wait for the complete response before returning',
			},
			{
				name: 'Streaming',
				value: 'streaming',
				description: 'Stream the response as it\'s generated (Server-Sent Events)',
			},
		],
		default: 'blocking',
		description: 'How to handle the AI response',
	},
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['send'],
			},
		},
		default: '',
		description: 'ID of an existing conversation to continue. Leave empty to start a new conversation.',
		placeholder: 'e.g., 12345678-1234-5678-9012-123456789012',
	},
	{
		displayName: 'User ID',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['send'],
			},
		},
		default: '',
		description: 'Unique identifier for the user. Used for tracking and analytics.',
		placeholder: 'user123',
	},
	{
		displayName: 'Auto Generate Conversation Name',
		name: 'autoGenerateName',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['send'],
			},
		},
		default: true,
		description: 'Whether to automatically generate a name for new conversations',
	},
	{
		displayName: 'Additional Inputs',
		name: 'inputs',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['send'],
			},
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Additional inputs to pass to the Dify application',
		options: [
			{
				name: 'inputsValues',
				displayName: 'Input',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						description: 'The input variable name as defined in your Dify app',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'The value for this input variable',
					},
				],
			},
		],
	},
	{
		displayName: 'Files',
		name: 'files',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['send'],
			},
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Files to attach to the chat message',
		options: [
			{
				name: 'filesValues',
				displayName: 'File',
				values: [
					{
						displayName: 'Input Data Field Name',
						name: 'inputDataFieldName',
						type: 'string',
						default: 'data',
						description: 'The name of the binary property that contains the file to upload',
					},
					{
						displayName: 'File Type',
						name: 'type',
						type: 'options',
						options: [
							{
								name: 'Image',
								value: 'image',
							},
							{
								name: 'Document',
								value: 'document',
							},
							{
								name: 'Audio',
								value: 'audio',
							},
							{
								name: 'Video',
								value: 'video',
							},
						],
						default: 'document',
						description: 'The type of file being uploaded',
					},
				],
			},
		],
	},

	// Stop Generation Fields
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['stop'],
			},
		},
		default: '',
		description: 'The task ID of the chat message generation to stop',
		placeholder: 'task-12345678-1234-5678-9012-123456789012',
	},
	{
		displayName: 'User ID',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['stop'],
			},
		},
		default: '',
		description: 'The user ID associated with the task',
		placeholder: 'user123',
	},

	// Get Suggestions Fields
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['getSuggestions'],
			},
		},
		default: '',
		description: 'The message ID to get suggested questions for',
		placeholder: 'msg-12345678-1234-5678-9012-123456789012',
	},
	{
		displayName: 'User ID',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['chat'],
				operation: ['getSuggestions'],
			},
		},
		default: '',
		description: 'The user ID associated with the message',
		placeholder: 'user123',
	},
];