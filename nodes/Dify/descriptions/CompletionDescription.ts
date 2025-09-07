import type { INodeProperties } from 'n8n-workflow';

export const completionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['completion'],
			},
		},
		options: [
			{
				name: 'Create Completion',
				value: 'create',
				description: 'Create a text completion using the Dify application',
				action: 'Create a text completion',
			},
			{
				name: 'Stop Generation',
				value: 'stop',
				description: 'Stop an ongoing text completion generation',
				action: 'Stop completion generation',
			},
		],
		default: 'create',
	},
];

export const completionFields: INodeProperties[] = [
	// Create Completion Fields
	{
		displayName: 'Inputs',
		name: 'inputs',
		type: 'fixedCollection',
		required: true,
		displayOptions: {
			show: {
				resource: ['completion'],
				operation: ['create'],
			},
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Input variables for the completion as defined in your Dify application',
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
						required: true,
						description: 'The input variable name as defined in your Dify app',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						required: true,
						description: 'The value for this input variable',
					},
				],
			},
		],
	},
	{
		displayName: 'Response Mode',
		name: 'responseMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['completion'],
				operation: ['create'],
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
		displayName: 'User ID',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['completion'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Unique identifier for the user. Used for tracking and analytics.',
		placeholder: 'user123',
	},
	{
		displayName: 'Files',
		name: 'files',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['completion'],
				operation: ['create'],
			},
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Files to attach to the completion request',
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
				resource: ['completion'],
				operation: ['stop'],
			},
		},
		default: '',
		description: 'The task ID of the completion generation to stop',
		placeholder: 'task-12345678-1234-5678-9012-123456789012',
	},
	{
		displayName: 'User ID',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['completion'],
				operation: ['stop'],
			},
		},
		default: '',
		description: 'The user ID associated with the task',
		placeholder: 'user123',
	},
];