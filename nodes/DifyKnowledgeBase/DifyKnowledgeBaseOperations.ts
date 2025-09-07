import type {
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';

import { NodeOperationError, NodeApiError } from 'n8n-workflow';

import { difyApiRequest, extractFileInfo, validateFileUpload } from '../../utils/GenericFunctions';

import type { IDifyRequestOptions } from '../../utils/types';

// Helper function to safely convert API responses to IDataObject
function toDataObject(data: any): IDataObject {
	return data as unknown as IDataObject;
}

// Helper function to safely handle errors for NodeApiError  
function toError(error: any): Record<string, any> {
	if (error && typeof error === 'object') {
		// Filter out undefined values to ensure JsonObject compatibility
		const errorObj: Record<string, any> = {
			message: error.message || 'Unknown error',
		};
		
		if (error.code || error.httpCode) {
			errorObj.code = error.code || error.httpCode;
		}
		if (error.status || error.statusCode) {
			errorObj.status = error.status || error.statusCode;
		}
		
		// Add other properties that are not undefined
		Object.keys(error).forEach(key => {
			if (error[key] !== undefined && !['message', 'code', 'httpCode', 'status', 'statusCode'].includes(key)) {
				errorObj[key] = error[key];
			}
		});
		
		return errorObj;
	}
	return { message: String(error) };
}

// ================================
// Dataset Operations
// ================================

export async function listDatasets(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	
	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: '/datasets',
			query: {
				page: additionalFields.page || 1,
				limit: additionalFields.limit || 20,
			},
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function createDataset(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const name = this.getNodeParameter('name', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		name,
	};

	// Add optional fields
	if (additionalFields.description) {
		body.description = additionalFields.description as string;
	}
	if (additionalFields.permission) {
		body.permission = additionalFields.permission as string;
	}
	if (additionalFields.indexing_technique) {
		body.indexing_technique = additionalFields.indexing_technique as string;
	}
	if (additionalFields.embedding_model) {
		body.embedding_model = additionalFields.embedding_model as string;
	}
	if (additionalFields.embedding_model_provider) {
		body.embedding_model_provider = additionalFields.embedding_model_provider as string;
	}
	if (additionalFields.retrieval_model && typeof additionalFields.retrieval_model === 'object') {
		const retrievalModel = additionalFields.retrieval_model as IDataObject;
		if (retrievalModel.retrievalModelValue && typeof retrievalModel.retrievalModelValue === 'object') {
			const rmv = retrievalModel.retrievalModelValue as IDataObject;
			body.retrieval_model = {
				search_method: rmv.search_method,
				reranking_enable: rmv.reranking_enable,
				top_k: rmv.top_k,
				score_threshold_enabled: rmv.score_threshold_enabled,
				score_threshold: rmv.score_threshold,
			};
		}
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: '/datasets',
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function getDataset(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: `/datasets/${datasetId}`,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function updateDataset(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {};

	// Add optional fields
	if (additionalFields.name) {
		body.name = additionalFields.name as string;
	}
	if (additionalFields.description) {
		body.description = additionalFields.description as string;
	}
	if (additionalFields.permission) {
		body.permission = additionalFields.permission as string;
	}
	if (additionalFields.indexing_technique) {
		body.indexing_technique = additionalFields.indexing_technique as string;
	}
	if (additionalFields.embedding_model) {
		body.embedding_model = additionalFields.embedding_model as string;
	}
	if (additionalFields.embedding_model_provider) {
		body.embedding_model_provider = additionalFields.embedding_model_provider as string;
	}
	if (additionalFields.retrieval_model && typeof additionalFields.retrieval_model === 'object') {
		const retrievalModel = additionalFields.retrieval_model as IDataObject;
		if (retrievalModel.retrievalModelValue && typeof retrievalModel.retrievalModelValue === 'object') {
			const rmv = retrievalModel.retrievalModelValue as IDataObject;
			body.retrieval_model = {
				search_method: rmv.search_method,
				reranking_enable: rmv.reranking_enable,
				top_k: rmv.top_k,
				score_threshold_enabled: rmv.score_threshold_enabled,
				score_threshold: rmv.score_threshold,
			};
		}
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'PATCH',
			endpoint: `/datasets/${datasetId}`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function deleteDataset(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'DELETE',
			endpoint: `/datasets/${datasetId}`,
		};

		await difyApiRequest.call(this, options);

		return {
			json: { success: true, message: 'Dataset deleted successfully' },
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function getDatasetChunks(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const query = this.getNodeParameter('query', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		query,
	};

	// Add optional retrieval model configuration
	if (additionalFields.search_method || additionalFields.top_k || additionalFields.score_threshold_enabled) {
		body.retrieval_model = {
			search_method: additionalFields.search_method || 'semantic_search',
			top_k: additionalFields.top_k || 4,
			score_threshold_enabled: additionalFields.score_threshold_enabled || false,
		};

		if (additionalFields.score_threshold_enabled && additionalFields.score_threshold) {
			(body.retrieval_model as IDataObject).score_threshold = additionalFields.score_threshold;
		}
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/hit-testing`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

// ================================
// Document Operations
// ================================

export async function createDocumentFromText(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const text = this.getNodeParameter('text', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		name,
		text,
	};

	// Add optional fields
	if (additionalFields.indexing_technique) {
		body.indexing_technique = additionalFields.indexing_technique as string;
	}
	if (additionalFields.process_rule && typeof additionalFields.process_rule === 'object') {
		const processRule = additionalFields.process_rule as IDataObject;
		if (processRule.processRuleValue && typeof processRule.processRuleValue === 'object') {
			const prv = processRule.processRuleValue as IDataObject;
			body.process_rule = {
				mode: prv.mode,
			};

			if (prv.mode === 'custom') {
				(body.process_rule as IDataObject).rules = {};

				if (prv.pre_processing_rules) {
					const rules = Array.isArray(prv.pre_processing_rules) 
						? prv.pre_processing_rules 
						: [prv.pre_processing_rules];
					((body.process_rule as IDataObject).rules as IDataObject).pre_processing_rules = rules.map((rule: any) => ({
						id: rule.id,
						enabled: rule.enabled,
					}));
				}

				if (prv.segmentation && typeof prv.segmentation === 'object') {
					const segmentation = prv.segmentation as IDataObject;
					if (segmentation.segmentationValue && typeof segmentation.segmentationValue === 'object') {
						const sv = segmentation.segmentationValue as IDataObject;
						((body.process_rule as IDataObject).rules as IDataObject).segmentation = {
							separator: sv.separator,
							max_tokens: sv.max_tokens,
						};
					}
				}
			}
		}
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/document/create_by_text`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function createDocumentFromFile(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const filePropertyName = this.getNodeParameter('file', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	// Get file from binary data
	const binaryData = this.helpers.assertBinaryData(index, filePropertyName);
	const fileInfo = extractFileInfo(binaryData);

	// Validate file
	const validation = validateFileUpload(fileInfo, ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], 15 * 1024 * 1024);
	if (!validation.valid) {
		throw new NodeOperationError(this.getNode(), validation.error!, { itemIndex: index });
	}

	const body: IDataObject = {};

	// Add optional fields
	if (additionalFields.name) {
		body.name = additionalFields.name as string;
	}
	if (additionalFields.indexing_technique) {
		body.indexing_technique = additionalFields.indexing_technique as string;
	}
	if (additionalFields.process_rule && typeof additionalFields.process_rule === 'object') {
		const processRule = additionalFields.process_rule as IDataObject;
		if (processRule.processRuleValue) {
			body.process_rule = JSON.stringify({
				mode: (processRule.processRuleValue as IDataObject).mode,
				rules: (processRule.processRuleValue as IDataObject).mode === 'custom' ? {
					pre_processing_rules: (processRule.processRuleValue as IDataObject).pre_processing_rules,
					segmentation: (processRule.processRuleValue as IDataObject).segmentation,
				} : undefined,
			});
		}
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/document/create_by_file`,
			body: {
				...body,
				file: {
					value: fileInfo.data,
					options: {
						filename: fileInfo.name,
						contentType: fileInfo.mimeType,
					},
				},
			},
			encoding: 'form',
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function updateDocumentText(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const documentId = this.getNodeParameter('documentId', index) as string;
	const text = this.getNodeParameter('text', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		text,
	};

	// Add optional fields
	if (additionalFields.name) {
		body.name = additionalFields.name as string;
	}
	if (additionalFields.process_rule && typeof additionalFields.process_rule === 'object') {
		const processRule = additionalFields.process_rule as IDataObject;
		if (processRule.processRuleValue && typeof processRule.processRuleValue === 'object') {
			const prv = processRule.processRuleValue as IDataObject;
			body.process_rule = {
				mode: prv.mode,
			};

			if (prv.mode === 'custom') {
				(body.process_rule as IDataObject).rules = {};

				if (prv.pre_processing_rules) {
					const rules = Array.isArray(prv.pre_processing_rules) 
						? prv.pre_processing_rules 
						: [prv.pre_processing_rules];
					((body.process_rule as IDataObject).rules as IDataObject).pre_processing_rules = rules.map((rule: any) => ({
						id: rule.id,
						enabled: rule.enabled,
					}));
				}

				if (prv.segmentation && typeof prv.segmentation === 'object') {
					const segmentation = prv.segmentation as IDataObject;
					if (segmentation.segmentationValue && typeof segmentation.segmentationValue === 'object') {
						const sv = segmentation.segmentationValue as IDataObject;
						((body.process_rule as IDataObject).rules as IDataObject).segmentation = {
							separator: sv.separator,
							max_tokens: sv.max_tokens,
						};
					}
				}
			}
		}
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/documents/${documentId}/update_by_text`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function updateDocumentFile(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const documentId = this.getNodeParameter('documentId', index) as string;
	const filePropertyName = this.getNodeParameter('file', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	// Get file from binary data
	const binaryData = this.helpers.assertBinaryData(index, filePropertyName);
	const fileInfo = extractFileInfo(binaryData);

	// Validate file
	const validation = validateFileUpload(fileInfo, ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], 15 * 1024 * 1024);
	if (!validation.valid) {
		throw new NodeOperationError(this.getNode(), validation.error!, { itemIndex: index });
	}

	const body: IDataObject = {};

	// Add optional fields
	if (additionalFields.name) {
		body.name = additionalFields.name as string;
	}
	if (additionalFields.process_rule && typeof additionalFields.process_rule === 'object') {
		const processRule = additionalFields.process_rule as IDataObject;
		if (processRule.processRuleValue) {
			body.process_rule = JSON.stringify({
				mode: (processRule.processRuleValue as IDataObject).mode,
				rules: (processRule.processRuleValue as IDataObject).mode === 'custom' ? {
					pre_processing_rules: (processRule.processRuleValue as IDataObject).pre_processing_rules,
					segmentation: (processRule.processRuleValue as IDataObject).segmentation,
				} : undefined,
			});
		}
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/documents/${documentId}/update_by_file`,
			body: {
				...body,
				file: {
					value: fileInfo.data,
					options: {
						filename: fileInfo.name,
						contentType: fileInfo.mimeType,
					},
				},
			},
			encoding: 'form',
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function getDocument(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const documentId = this.getNodeParameter('documentId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: `/datasets/${datasetId}/documents/${documentId}`,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function listDocuments(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: `/datasets/${datasetId}/documents`,
			query: {
				page: additionalFields.page || 1,
				limit: additionalFields.limit || 20,
				sort: additionalFields.sort || '-created_at',
				keyword: additionalFields.keyword || '',
			},
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function deleteDocument(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const documentId = this.getNodeParameter('documentId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'DELETE',
			endpoint: `/datasets/${datasetId}/documents/${documentId}`,
		};

		await difyApiRequest.call(this, options);

		return {
			json: { success: true, message: 'Document deleted successfully' },
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function getDocumentStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const batch = this.getNodeParameter('batch', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: `/datasets/${datasetId}/documents/indexing-status`,
			query: {
				batch,
			},
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function updateDocumentStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const batch = this.getNodeParameter('batch', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/documents/indexing-status`,
			body: {
				batch,
			},
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

// ================================
// Segment Operations
// ================================

export async function listSegments(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const documentId = this.getNodeParameter('documentId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: `/datasets/${datasetId}/documents/${documentId}/segments`,
			query: {
				page: additionalFields.page || 1,
				limit: additionalFields.limit || 20,
				sort: additionalFields.sort || '-created_at',
				keyword: additionalFields.keyword || '',
			},
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function addSegments(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const documentId = this.getNodeParameter('documentId', index) as string;
	const segmentsInput = this.getNodeParameter('segments', index) as IDataObject;

	// Process segments input
	const segmentValues = segmentsInput.segmentValue;
	const segments = Array.isArray(segmentValues) ? segmentValues : [segmentValues];

	const body: IDataObject = {
		segments: segments.map((segment: any) => ({
			content: segment.content,
			answer: segment.answer || undefined,
			keywords: segment.keywords ? segment.keywords.split(',').map((k: string) => k.trim()) : undefined,
		})),
	};

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/documents/${documentId}/segments`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function getSegment(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const segmentId = this.getNodeParameter('segmentId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: `/datasets/${datasetId}/segments/${segmentId}`,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function updateSegment(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const segmentId = this.getNodeParameter('segmentId', index) as string;
	const content = this.getNodeParameter('content', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		content,
	};

	// Add optional fields
	if (additionalFields.answer) {
		body.answer = additionalFields.answer as string;
	}
	if (additionalFields.keywords) {
		body.keywords = (additionalFields.keywords as string).split(',').map(k => k.trim());
	}
	if (typeof additionalFields.enabled === 'boolean') {
		body.enabled = additionalFields.enabled;
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/segments/${segmentId}`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function deleteSegment(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const segmentId = this.getNodeParameter('segmentId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'DELETE',
			endpoint: `/datasets/${datasetId}/segments/${segmentId}`,
		};

		await difyApiRequest.call(this, options);

		return {
			json: { success: true, message: 'Segment deleted successfully' },
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function getSegmentChildren(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const segmentId = this.getNodeParameter('segmentId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: `/datasets/${datasetId}/segments/${segmentId}/child-chunks`,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function createSegmentChild(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const segmentId = this.getNodeParameter('segmentId', index) as string;
	const content = this.getNodeParameter('content', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		content,
	};

	// Add optional fields
	if (additionalFields.answer) {
		body.answer = additionalFields.answer as string;
	}
	if (additionalFields.keywords) {
		body.keywords = (additionalFields.keywords as string).split(',').map(k => k.trim());
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/segments/${segmentId}/child-chunks`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function updateSegmentChild(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const segmentId = this.getNodeParameter('segmentId', index) as string;
	const childId = this.getNodeParameter('childId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {};

	// Add optional fields
	if (additionalFields.content) {
		body.content = additionalFields.content as string;
	}
	if (additionalFields.answer) {
		body.answer = additionalFields.answer as string;
	}
	if (additionalFields.keywords) {
		body.keywords = (additionalFields.keywords as string).split(',').map(k => k.trim());
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/segments/${segmentId}/child-chunks/${childId}`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function deleteSegmentChild(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const segmentId = this.getNodeParameter('segmentId', index) as string;
	const childId = this.getNodeParameter('childId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'DELETE',
			endpoint: `/datasets/${datasetId}/segments/${segmentId}/child-chunks/${childId}`,
		};

		await difyApiRequest.call(this, options);

		return {
			json: { success: true, message: 'Child segment deleted successfully' },
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

// ================================
// Metadata Operations (Tags)
// ================================

export async function getTags(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	try {
		const options: IDifyRequestOptions = {
			method: 'GET',
			endpoint: `/datasets/${datasetId}/tags`,
			query: {
				page: additionalFields.page || 1,
				limit: additionalFields.limit || 20,
			},
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function createTag(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		name,
	};

	// Add optional fields
	if (additionalFields.color) {
		body.color = additionalFields.color as string;
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/tags`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function updateTag(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const tagId = this.getNodeParameter('tagId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {};

	// Add optional fields
	if (additionalFields.name) {
		body.name = additionalFields.name as string;
	}
	if (additionalFields.color) {
		body.color = additionalFields.color as string;
	}

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/tags/${tagId}`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: toDataObject(response),
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function deleteTag(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const tagId = this.getNodeParameter('tagId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'DELETE',
			endpoint: `/datasets/${datasetId}/tags/${tagId}`,
		};

		await difyApiRequest.call(this, options);

		return {
			json: { success: true, message: 'Tag deleted successfully' },
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function bindTag(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const documentId = this.getNodeParameter('documentId', index) as string;
	const tagIds = this.getNodeParameter('tagIds', index) as string;

	const body: IDataObject = {
		tag_ids: tagIds.split(',').map(id => id.trim()),
	};

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/documents/${documentId}/tags/bind`,
			body,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: { success: true, message: 'Tags bound successfully', ...toDataObject(response) },
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}

export async function unbindTag(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData> {
	const datasetId = this.getNodeParameter('datasetId', index) as string;
	const documentId = this.getNodeParameter('documentId', index) as string;
	const tagId = this.getNodeParameter('tagId', index) as string;

	try {
		const options: IDifyRequestOptions = {
			method: 'POST',
			endpoint: `/datasets/${datasetId}/documents/${documentId}/tags/${tagId}/unbind`,
		};

		const response = await difyApiRequest.call(this, options);

		return {
			json: { success: true, message: 'Tag unbound successfully', ...toDataObject(response) },
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), toError(error), { itemIndex: index });
	}
}