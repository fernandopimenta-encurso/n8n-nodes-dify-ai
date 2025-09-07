import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import {
	// Dataset operations
	listDatasets,
	createDataset,
	getDataset,
	updateDataset,
	deleteDataset,
	getDatasetChunks,
	// Document operations
	createDocumentFromText,
	createDocumentFromFile,
	updateDocumentText,
	updateDocumentFile,
	getDocument,
	listDocuments,
	deleteDocument,
	getDocumentStatus,
	updateDocumentStatus,
	// Segment operations
	listSegments,
	addSegments,
	getSegment,
	updateSegment,
	deleteSegment,
	getSegmentChildren,
	createSegmentChild,
	updateSegmentChild,
	deleteSegmentChild,
	// Metadata operations
	getTags,
	createTag,
	updateTag,
	deleteTag,
	bindTag,
	unbindTag,
} from './DifyKnowledgeBaseOperations';

import {
	resource,
	knowledgeBaseOperations,
	knowledgeBaseFields,
} from './descriptions/KnowledgeBaseDescription';

export class DifyKnowledgeBase implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dify Knowledge Base',
		name: 'difyKnowledgeBase',
		icon: 'file:dify.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Manage Dify AI knowledge base datasets, documents, segments, and metadata with comprehensive CRUD operations',
		defaults: {
			name: 'Dify Knowledge Base',
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
			...knowledgeBaseOperations,
			...knowledgeBaseFields,
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

				if (resource === 'dataset') {
					switch (operation) {
						case 'list':
							responseData = await listDatasets.call(this, i);
							break;
						case 'create':
							responseData = await createDataset.call(this, i);
							break;
						case 'get':
							responseData = await getDataset.call(this, i);
							break;
						case 'update':
							responseData = await updateDataset.call(this, i);
							break;
						case 'delete':
							responseData = await deleteDataset.call(this, i);
							break;
						case 'getChunks':
							responseData = await getDatasetChunks.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "dataset"`,
								{ itemIndex: i },
							);
					}
				} else if (resource === 'document') {
					switch (operation) {
						case 'createFromText':
							responseData = await createDocumentFromText.call(this, i);
							break;
						case 'createFromFile':
							responseData = await createDocumentFromFile.call(this, i);
							break;
						case 'updateText':
							responseData = await updateDocumentText.call(this, i);
							break;
						case 'updateFile':
							responseData = await updateDocumentFile.call(this, i);
							break;
						case 'get':
							responseData = await getDocument.call(this, i);
							break;
						case 'list':
							responseData = await listDocuments.call(this, i);
							break;
						case 'delete':
							responseData = await deleteDocument.call(this, i);
							break;
						case 'getStatus':
							responseData = await getDocumentStatus.call(this, i);
							break;
						case 'updateStatus':
							responseData = await updateDocumentStatus.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "document"`,
								{ itemIndex: i },
							);
					}
				} else if (resource === 'segment') {
					switch (operation) {
						case 'list':
							responseData = await listSegments.call(this, i);
							break;
						case 'add':
							responseData = await addSegments.call(this, i);
							break;
						case 'get':
							responseData = await getSegment.call(this, i);
							break;
						case 'update':
							responseData = await updateSegment.call(this, i);
							break;
						case 'delete':
							responseData = await deleteSegment.call(this, i);
							break;
						case 'getChildren':
							responseData = await getSegmentChildren.call(this, i);
							break;
						case 'createChild':
							responseData = await createSegmentChild.call(this, i);
							break;
						case 'updateChild':
							responseData = await updateSegmentChild.call(this, i);
							break;
						case 'deleteChild':
							responseData = await deleteSegmentChild.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "segment"`,
								{ itemIndex: i },
							);
					}
				} else if (resource === 'metadata') {
					switch (operation) {
						case 'getTags':
							responseData = await getTags.call(this, i);
							break;
						case 'createTag':
							responseData = await createTag.call(this, i);
							break;
						case 'updateTag':
							responseData = await updateTag.call(this, i);
							break;
						case 'deleteTag':
							responseData = await deleteTag.call(this, i);
							break;
						case 'bindTag':
							responseData = await bindTag.call(this, i);
							break;
						case 'unbindTag':
							responseData = await unbindTag.call(this, i);
							break;
						default:
							throw new NodeOperationError(
								this.getNode(),
								`The operation "${operation}" is not supported for resource "metadata"`,
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
							resource,
							operation,
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