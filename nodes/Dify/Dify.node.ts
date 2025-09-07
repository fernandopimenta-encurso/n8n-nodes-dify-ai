import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

import {
	sendChatMessage,
	stopChatGeneration,
	getChatSuggestions,
	createCompletion,
	stopCompletionGeneration,
	submitFeedback,
} from './DifyOperations';

import { resource, commonFields } from './descriptions/shared';
import { chatOperations, chatFields } from './descriptions/ChatDescription';
import { completionOperations, completionFields } from './descriptions/CompletionDescription';
import { feedbackOperations, feedbackFields } from './descriptions/FeedbackDescription';

export class Dify implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dify',
		name: 'dify',
		icon: 'file:dify.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Dify AI platform - chat, completions, and feedback',
		defaults: {
			name: 'Dify',
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
			resource,
			...chatOperations,
			...completionOperations,
			...feedbackOperations,
			...chatFields,
			...completionFields,
			...feedbackFields,
			...commonFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				if (resource === 'chat') {
					if (operation === 'send') {
						responseData = await sendChatMessage(this, i);
					} else if (operation === 'stop') {
						responseData = await stopChatGeneration(this, i);
					} else if (operation === 'getSuggestions') {
						responseData = await getChatSuggestions(this, i);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for resource "chat"`,
							{ itemIndex: i },
						);
					}
				} else if (resource === 'completion') {
					if (operation === 'create') {
						responseData = await createCompletion(this, i);
					} else if (operation === 'stop') {
						responseData = await stopCompletionGeneration(this, i);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for resource "completion"`,
							{ itemIndex: i },
						);
					}
				} else if (resource === 'feedback') {
					if (operation === 'submit') {
						responseData = await submitFeedback(this, i);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for resource "feedback"`,
							{ itemIndex: i },
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The resource "${resource}" is not supported`,
						{ itemIndex: i },
					);
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData);
				} else {
					returnData.push({
						json: responseData,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
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