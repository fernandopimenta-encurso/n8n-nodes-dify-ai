import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

import {
	uploadFile,
	previewFile,
	getFileInfo,
} from './DifyFileOperations';

import { resource, fileOperations, fileFields } from './descriptions/FileDescription';

export class DifyFile implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dify File',
		name: 'difyFile',
		icon: 'file:dify.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Upload and manage files in Dify AI platform for use in conversations and workflows',
		defaults: {
			name: 'Dify File',
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
			},
		},
		properties: [
			resource,
			...fileOperations,
			...fileFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: INodeExecutionData;

				if (resource === 'file') {
					switch (operation) {
						case 'upload':
							responseData = await uploadFile(this, i);
							break;
						case 'preview':
							responseData = await previewFile(this, i);
							break;
						case 'getInfo':
							responseData = await getFileInfo(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "file"`,
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

				// Add the response data to return data
				returnData.push(responseData);
				
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							operation,
							resource,
							item_index: i,
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