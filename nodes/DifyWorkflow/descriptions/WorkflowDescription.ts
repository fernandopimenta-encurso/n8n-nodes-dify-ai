import type { INodeProperties } from 'n8n-workflow';

export const workflowOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['workflow'],
			},
		},
		options: [
			{
				name: 'Execute',
				value: 'execute',
				description: 'Execute a workflow with input parameters',
				action: 'Execute a workflow',
			},
			{
				name: 'Get Details',
				value: 'getDetails',
				description: 'Get details of a workflow run',
				action: 'Get workflow run details',
			},
			{
				name: 'Stop',
				value: 'stop',
				description: 'Stop an ongoing workflow task',
				action: 'Stop workflow execution',
			},
			{
				name: 'Get Logs',
				value: 'getLogs',
				description: 'Get execution logs for a workflow run',
				action: 'Get workflow execution logs',
			},
		],
		default: 'execute',
	},
];

export const workflowFields: INodeProperties[] = [
	// Execute operation fields
	{
		displayName: 'Inputs',
		name: 'inputs',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['execute'],
			},
		},
		default: '{}',
		description: 'Input parameters for the workflow execution as a JSON object',
		placeholder: '{"key": "value", "parameter": "data"}',
		validateType: 'object',
	},
	{
		displayName: 'Response Mode',
		name: 'responseMode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['execute'],
			},
		},
		options: [
			{
				name: 'Blocking',
				value: 'blocking',
				description: 'Wait for the complete workflow execution before returning response',
			},
			{
				name: 'Streaming',
				value: 'streaming',
				description: 'Return real-time updates as the workflow executes',
			},
		],
		default: 'blocking',
		description: 'How to handle the workflow execution response',
	},
	{
		displayName: 'User ID',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['execute'],
			},
		},
		default: '',
		description: 'User identifier for workflow execution tracking (optional)',
		placeholder: 'user-123',
	},
	
	// Get Details operation fields
	{
		displayName: 'Workflow Run ID',
		name: 'workflowRunId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['getDetails', 'getLogs'],
			},
		},
		default: '',
		required: true,
		description: 'The ID of the workflow run to retrieve details/logs for',
		placeholder: 'workflow-run-abc123',
	},

	// Stop operation fields
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['stop'],
			},
		},
		default: '',
		required: true,
		description: 'The task ID of the workflow execution to stop',
		placeholder: 'task-abc123',
	},

	// File uploads for workflow execution
	{
		displayName: 'Input Binary Property',
		name: 'binaryProperty',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['workflow'],
				operation: ['execute'],
			},
		},
		default: '',
		description: 'Name of the binary property containing files to upload with the workflow',
		placeholder: 'data',
	},

	// Additional Options for all operations
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['workflow'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Include Execution Metadata',
				name: 'includeMetadata',
				type: 'boolean',
				default: false,
				description: 'Whether to include detailed execution metadata in the response',
			},
			{
				displayName: 'Include Usage Stats',
				name: 'includeUsage',
				type: 'boolean',
				default: false,
				description: 'Whether to include token usage and cost information in the response',
			},
			{
				displayName: 'Maximum Files',
				name: 'maxFiles',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				default: 5,
				description: 'Maximum number of files to process from binary input',
				displayOptions: {
					show: {
						'/operation': ['execute'],
					},
				},
			},
			{
				displayName: 'Poll Interval (Seconds)',
				name: 'pollInterval',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 30,
				},
				default: 2,
				description: 'How often to check for workflow completion when using blocking mode',
				displayOptions: {
					show: {
						'/operation': ['execute'],
						'/responseMode': ['blocking'],
					},
				},
			},
			{
				displayName: 'Return Intermediate Results',
				name: 'returnIntermediateResults',
				type: 'boolean',
				default: false,
				description: 'Whether to return intermediate workflow step results in streaming mode',
				displayOptions: {
					show: {
						'/operation': ['execute'],
						'/responseMode': ['streaming'],
					},
				},
			},
			{
				displayName: 'Timeout (Seconds)',
				name: 'timeout',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 600, // 10 minutes max for workflows
				},
				default: 60,
				description: 'Maximum time to wait for workflow completion (applies to blocking mode)',
			},
		],
	},
];