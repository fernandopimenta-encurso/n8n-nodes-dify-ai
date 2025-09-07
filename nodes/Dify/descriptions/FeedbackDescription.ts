import type { INodeProperties } from 'n8n-workflow';

export const feedbackOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['feedback'],
			},
		},
		options: [
			{
				name: 'Submit Feedback',
				value: 'submit',
				description: 'Submit feedback for a message response',
				action: 'Submit message feedback',
			},
		],
		default: 'submit',
	},
];

export const feedbackFields: INodeProperties[] = [
	// Submit Feedback Fields
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['submit'],
			},
		},
		default: '',
		description: 'The message ID to provide feedback for',
		placeholder: 'msg-12345678-1234-5678-9012-123456789012',
	},
	{
		displayName: 'Rating',
		name: 'rating',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['submit'],
			},
		},
		options: [
			{
				name: 'Like',
				value: 'like',
				description: 'Positive feedback - the response was helpful',
			},
			{
				name: 'Dislike',
				value: 'dislike',
				description: 'Negative feedback - the response was not helpful',
			},
		],
		default: 'like',
		description: 'Whether the message response was helpful or not',
	},
	{
		displayName: 'Feedback Content',
		name: 'content',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['submit'],
			},
		},
		default: '',
		description: 'Optional detailed feedback content explaining the rating',
		placeholder: 'The response was accurate but could be more detailed...',
	},
	{
		displayName: 'User ID',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['feedback'],
				operation: ['submit'],
			},
		},
		default: '',
		description: 'The user ID associated with the feedback',
		placeholder: 'user123',
	},
];