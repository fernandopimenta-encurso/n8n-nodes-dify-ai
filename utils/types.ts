import type { IDataObject } from 'n8n-workflow';

// Base API Response Structure
export interface IDifyApiResponse {
	event?: string;
	message_id?: string;
	conversation_id?: string;
	mode?: string;
	created_at?: number;
}

// Chat Message Types
export interface IChatMessage {
	id: string;
	conversation_id: string;
	inputs: IDataObject;
	query: string;
	message_files?: IMessageFile[];
	response?: string;
	created_at: number;
	feedback?: IDataObject;
}

export interface IMessageFile {
	id: string;
	type: 'image' | 'document' | 'audio' | 'video';
	name: string;
	url?: string;
	size?: number;
	extension?: string;
}

// Chat Response Types
export interface IChatResponse extends IDifyApiResponse {
	answer: string;
	metadata?: {
		usage: IUsageData;
		retriever_resources?: IRetrieverResource[];
	};
}

export interface IChatStreamResponse extends IDifyApiResponse {
	answer?: string;
	metadata?: {
		usage: IUsageData;
		retriever_resources?: IRetrieverResource[];
	};
}

export interface IUsageData {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
	prompt_unit_price: string;
	prompt_price_unit: string;
	prompt_price: string;
	completion_unit_price: string;
	completion_price_unit: string;
	completion_price: string;
	total_price: string;
	currency: string;
	latency: number;
}

export interface IRetrieverResource {
	position: number;
	dataset_id: string;
	dataset_name: string;
	document_id: string;
	document_name: string;
	segment_id: string;
	score: number;
	content: string;
}

// Completion Types
export interface ICompletionResponse extends IDifyApiResponse {
	answer: string;
	metadata?: {
		usage: IUsageData;
	};
}

// Feedback Types
export interface IFeedback {
	rating: 'like' | 'dislike';
	content?: string;
}

// Suggestion Types
export interface ISuggestion {
	id: string;
	content: string;
}

// Conversation Types
export interface IConversation {
	id: string;
	name: string;
	inputs: IDataObject;
	introduction: string;
	created_at: number;
}

export interface IConversationMessage {
	id: string;
	conversation_id: string;
	inputs: IDataObject;
	query: string;
	message_files: IMessageFile[];
	feedback?: IFeedback;
	retriever_resources?: IRetrieverResource[];
	created_at: number;
	response?: string;
}

// File Upload Types
export interface IFileUpload {
	id: string;
	name: string;
	size: number;
	extension: string;
	mime_type: string;
	created_by: string;
	created_at: number;
}

// Text-to-Speech Types
export interface ITTSResponse {
	audio: Buffer;
}

// Speech-to-Text Types
export interface ISTTResponse {
	text: string;
}

// Application Types
export interface IApplication {
	opening_statement: string;
	suggested_questions?: string[];
	suggested_questions_after_answer?: {
		enabled: boolean;
	};
	speech_to_text?: {
		enabled: boolean;
	};
	text_to_speech?: {
		enabled: boolean;
		voice?: string;
	};
	retriever_resource?: {
		enabled: boolean;
	};
	annotation_reply?: {
		enabled: boolean;
	};
	more_like_this?: {
		enabled: boolean;
	};
	user_input_form?: Array<{
		paragraph?: {
			label: string;
			variable: string;
			required: boolean;
			default: string;
		};
		select?: {
			label: string;
			variable: string;
			required: boolean;
			default: string;
			options: string[];
		};
	}>;
	pre_prompt?: string;
	file_upload?: {
		image: {
			enabled: boolean;
			number_limits: number;
			detail: 'low' | 'high';
			transfer_methods: string[];
		};
		audio?: {
			enabled: boolean;
			number_limits: number;
			detail: 'low' | 'high';
			transfer_methods: string[];
		};
	};
	system_parameters?: {
		image_file_size_limit?: string;
		video_file_size_limit?: string;
		audio_file_size_limit?: string;
	};
}

// Error Types
export interface IDifyError {
	code: string;
	message: string;
	status: number;
}

export interface IDifyApiError extends Error {
	httpCode?: string;
	description?: string;
}

// API Request Options
export interface IDifyRequestOptions {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	endpoint: string;
	body?: IDataObject;
	headers?: IDataObject;
	query?: IDataObject;
	encoding?: 'json' | 'form';
	returnFullResponse?: boolean;
	timeout?: number;
}

// Stream Response Types
export type StreamResponseCallback = (chunk: string) => void;

// Node Parameter Types
export interface IChatInputs extends IDataObject {
	query: string;
	inputs?: IDataObject;
	response_mode?: 'streaming' | 'blocking';
	conversation_id?: string;
	user?: string;
	auto_generate_name?: boolean;
	files?: IMessageFile[];
}

export interface ICompletionInputs extends IDataObject {
	inputs: IDataObject;
	response_mode?: 'streaming' | 'blocking';
	user?: string;
	files?: IMessageFile[];
}

// Workflow Types
export interface IWorkflow {
	id: string;
	name: string;
	description: string;
	created_at: number;
}

export interface IWorkflowRun {
	id: string;
	workflow_id: string;
	status: 'running' | 'succeeded' | 'failed' | 'stopped';
	inputs: IDataObject;
	outputs?: IDataObject;
	error?: string;
	elapsed_time?: number;
	total_tokens?: number;
	created_at: number;
}

export interface IWorkflowExecuteRequest extends IDataObject {
	inputs: IDataObject;
	response_mode?: 'streaming' | 'blocking';
	user?: string;
	files?: IMessageFile[];
}

export interface IWorkflowExecuteResponse extends IDifyApiResponse {
	task_id?: string;
	workflow_run_id: string;
	data?: {
		id: string;
		workflow_id: string;
		status: 'running' | 'succeeded' | 'failed' | 'stopped';
		outputs?: IDataObject;
		error?: string;
		elapsed_time?: number;
		total_tokens?: number;
		total_steps?: number;
		finished_at?: number;
		created_at: number;
	};
}

export interface IWorkflowStreamResponse extends IDifyApiResponse {
	task_id?: string;
	workflow_run_id?: string;
	data?: {
		id?: string;
		workflow_id?: string;
		sequence_number?: number;
		node_id?: string;
		node_type?: string;
		title?: string;
		index?: number;
		predecessor_node_id?: string;
		inputs?: IDataObject;
		process_data?: IDataObject;
		outputs?: IDataObject;
		status?: 'running' | 'succeeded' | 'failed';
		error?: string;
		elapsed_time?: number;
		execution_metadata?: {
			parallel_id?: string;
			parallel_start_node_id?: string;
		};
		created_at?: number;
		finished_at?: number;
	};
}

export interface IWorkflowRunDetails extends IDataObject {
	id: string;
	workflow_id: string;
	status: 'running' | 'succeeded' | 'failed' | 'stopped';
	inputs: IDataObject;
	outputs?: IDataObject;
	error?: string;
	elapsed_time?: number;
	total_tokens?: number;
	total_steps?: number;
	finished_at?: number;
	created_at: number;
}

export interface IWorkflowLog extends IDataObject {
	id: string;
	workflow_run_id: string;
	sequence_number: number;
	node_id: string;
	node_type: string;
	title: string;
	index: number;
	predecessor_node_id?: string;
	inputs: IDataObject;
	process_data?: IDataObject;
	outputs?: IDataObject;
	status: 'running' | 'succeeded' | 'failed';
	error?: string;
	elapsed_time?: number;
	execution_metadata?: {
		parallel_id?: string;
		parallel_start_node_id?: string;
	};
	created_at: number;
	finished_at?: number;
}

export interface IWorkflowLogResponse {
	workflow_run_logs: IWorkflowLog[];
}

// Node parameter types for workflow operations
export interface IWorkflowExecuteInputs extends IDataObject {
	inputs: IDataObject;
	response_mode?: 'streaming' | 'blocking';
	user?: string;
	files?: IMessageFile[];
}

export interface IWorkflowGetDetailsInputs extends IDataObject {
	workflow_run_id: string;
}

export interface IWorkflowStopInputs extends IDataObject {
	task_id: string;
}

export interface IWorkflowGetLogsInputs extends IDataObject {
	workflow_run_id: string;
}

// Dataset Types (for future DifyKnowledgeBase node)
export interface IDataset {
	id: string;
	name: string;
	description?: string;
	permission: 'only_me' | 'all_team_members';
	data_source_type: 'upload_file' | 'notion_import' | 'website_crawl';
	indexing_technique: 'high_quality' | 'economy';
	app_count: number;
	document_count: number;
	word_count: number;
	created_by: string;
	created_at: number;
	updated_at: number;
}

export interface IDocument {
	id: string;
	position: number;
	data_source_type: 'upload_file' | 'notion_import' | 'website_crawl';
	data_source_info: IDataObject;
	dataset_process_rule_id?: string;
	name: string;
	created_from: 'api' | 'web';
	created_by: string;
	created_at: number;
	tokens: number;
	indexing_status: 'waiting' | 'parsing' | 'cleaning' | 'splitting' | 'indexing' | 'completed' | 'error' | 'paused';
	error?: string;
	enabled: boolean;
	disabled_at?: number;
	disabled_by?: string;
	archived: boolean;
	display_status: 'available' | 'archiving' | 'archived' | 'paused';
	word_count: number;
	hit_count: number;
	doc_form: 'text_model' | 'qa_model';
}

// Utility type for API responses with pagination
export interface IPaginatedResponse<T> {
	data: T[];
	has_more: boolean;
	limit: number;
	total: number;
	page: number;
}

// Knowledge Base Types for DifyKnowledgeBase node

// Dataset Types
export interface IDatasetCreateRequest {
	name: string;
	description?: string;
	permission?: 'only_me' | 'all_team_members';
	indexing_technique?: 'high_quality' | 'economy';
	embedding_model?: string;
	embedding_model_provider?: string;
	retrieval_model?: {
		search_method: 'semantic_search' | 'full_text_search' | 'hybrid_search';
		reranking_enable?: boolean;
		reranking_model?: {
			reranking_provider_name: string;
			reranking_model_name: string;
		};
		top_k?: number;
		score_threshold_enabled?: boolean;
		score_threshold?: number;
	};
}

export interface IDatasetUpdateRequest {
	name?: string;
	description?: string;
	permission?: 'only_me' | 'all_team_members';
	indexing_technique?: 'high_quality' | 'economy';
	embedding_model?: string;
	embedding_model_provider?: string;
	retrieval_model?: {
		search_method: 'semantic_search' | 'full_text_search' | 'hybrid_search';
		reranking_enable?: boolean;
		reranking_model?: {
			reranking_provider_name: string;
			reranking_model_name: string;
		};
		top_k?: number;
		score_threshold_enabled?: boolean;
		score_threshold?: number;
	};
}

export interface IDatasetResponse {
	id: string;
	name: string;
	description?: string;
	permission: 'only_me' | 'all_team_members';
	data_source_type: 'upload_file' | 'notion_import' | 'website_crawl';
	indexing_technique: 'high_quality' | 'economy';
	app_count: number;
	document_count: number;
	word_count: number;
	created_by: string;
	created_at: number;
	updated_at: number;
	embedding_model?: string;
	embedding_model_provider?: string;
	retrieval_model?: {
		search_method: 'semantic_search' | 'full_text_search' | 'hybrid_search';
		reranking_enable: boolean;
		reranking_model?: {
			reranking_provider_name: string;
			reranking_model_name: string;
		};
		top_k: number;
		score_threshold_enabled: boolean;
		score_threshold?: number;
	};
}

export interface IDatasetListResponse {
	data: IDatasetResponse[];
	has_more: boolean;
	limit: number;
	total: number;
	page: number;
}

// Document Types
export interface IDocumentCreateFromTextRequest {
	name: string;
	text: string;
	indexing_technique?: 'high_quality' | 'economy';
	process_rule?: {
		mode?: 'automatic' | 'custom';
		rules?: {
			pre_processing_rules?: Array<{
				id: string;
				enabled: boolean;
			}>;
			segmentation?: {
				separator: string;
				max_tokens: number;
			};
		};
	};
}

export interface IDocumentCreateFromFileRequest {
	name?: string;
	indexing_technique?: 'high_quality' | 'economy';
	process_rule?: {
		mode?: 'automatic' | 'custom';
		rules?: {
			pre_processing_rules?: Array<{
				id: string;
				enabled: boolean;
			}>;
			segmentation?: {
				separator: string;
				max_tokens: number;
			};
		};
	};
}

export interface IDocumentUpdateTextRequest {
	name?: string;
	text: string;
	process_rule?: {
		mode?: 'automatic' | 'custom';
		rules?: {
			pre_processing_rules?: Array<{
				id: string;
				enabled: boolean;
			}>;
			segmentation?: {
				separator: string;
				max_tokens: number;
			};
		};
	};
}

export interface IDocumentResponse {
	id: string;
	position: number;
	data_source_type: 'upload_file' | 'notion_import' | 'website_crawl' | 'api';
	data_source_info?: IDataObject;
	dataset_process_rule_id?: string;
	name: string;
	created_from: 'api' | 'web';
	created_by: string;
	created_at: number;
	tokens: number;
	indexing_status: 'waiting' | 'parsing' | 'cleaning' | 'splitting' | 'indexing' | 'completed' | 'error' | 'paused';
	error?: string;
	enabled: boolean;
	disabled_at?: number;
	disabled_by?: string;
	archived: boolean;
	display_status: 'available' | 'archiving' | 'archived' | 'paused';
	word_count: number;
	hit_count: number;
	doc_form: 'text_model' | 'qa_model';
}

export interface IDocumentListResponse {
	data: IDocumentResponse[];
	has_more: boolean;
	limit: number;
	total: number;
	page: number;
}

export interface IDocumentStatusResponse {
	id: string;
	indexing_status: 'waiting' | 'parsing' | 'cleaning' | 'splitting' | 'indexing' | 'completed' | 'error' | 'paused';
	processing_started_at?: number;
	parsing_completed_at?: number;
	cleaning_completed_at?: number;
	splitting_completed_at?: number;
	completed_at?: number;
	paused_at?: number;
	error?: string;
	stopped_at?: number;
}

// Segment Types
export interface ISegment {
	id: string;
	position: number;
	document_id: string;
	content: string;
	answer?: string;
	word_count: number;
	tokens: number;
	keywords: string[];
	index_node_id: string;
	index_node_hash: string;
	hit_count: number;
	enabled: boolean;
	disabled_at?: number;
	disabled_by?: string;
	status: 'waiting' | 'completed' | 'error' | 'paused';
	created_by: string;
	created_at: number;
	indexing_at?: number;
	completed_at?: number;
	error?: string;
	stopped_at?: number;
}

export interface ISegmentCreateRequest {
	segments: Array<{
		content: string;
		answer?: string;
		keywords?: string[];
	}>;
}

export interface ISegmentUpdateRequest {
	content?: string;
	answer?: string;
	keywords?: string[];
	enabled?: boolean;
}

export interface ISegmentListResponse {
	data: ISegment[];
	doc_form: 'text_model' | 'qa_model';
}

export interface ISegmentChildSegment {
	id: string;
	content: string;
	answer?: string;
	keywords: string[];
	enabled: boolean;
	created_at: number;
}

export interface ISegmentChildrenResponse {
	data: ISegmentChildSegment[];
}

// Tag Types
export interface ITag {
	id: string;
	name: string;
	color: string;
	binding_count: number;
	created_by: string;
	created_at: number;
}

export interface ITagCreateRequest {
	name: string;
	color?: string;
}

export interface ITagUpdateRequest {
	name?: string;
	color?: string;
}

export interface ITagListResponse {
	data: ITag[];
}

export interface ITagBindRequest {
	tag_ids: string[];
}

// Hit Testing Types
export interface IHitTestingRequest {
	query: string;
	retrieval_model?: {
		search_method?: 'semantic_search' | 'full_text_search' | 'hybrid_search';
		reranking_enable?: boolean;
		reranking_model?: {
			reranking_provider_name: string;
			reranking_model_name: string;
		};
		top_k?: number;
		score_threshold_enabled?: boolean;
		score_threshold?: number;
	};
}

export interface IHitTestingResponse {
	query: {
		content: string;
	};
	records: Array<{
		segment: {
			id: string;
			position: number;
			document_id: string;
			content: string;
			answer?: string;
			word_count: number;
			tokens: number;
			keywords: string[];
			index_node_id: string;
			index_node_hash: string;
		};
		score: number;
		tsne_position?: {
			x: number;
			y: number;
		};
	}>;
}

// Operation Parameter Types for Knowledge Base node
export interface IKnowledgeBaseDatasetListParams {
	page?: number;
	limit?: number;
}

export interface IKnowledgeBaseDatasetCreateParams extends IDatasetCreateRequest {}

export interface IKnowledgeBaseDatasetGetParams {
	dataset_id: string;
}

export interface IKnowledgeBaseDatasetUpdateParams extends IDatasetUpdateRequest {
	dataset_id: string;
}

export interface IKnowledgeBaseDatasetDeleteParams {
	dataset_id: string;
}

export interface IKnowledgeBaseDocumentCreateFromTextParams extends IDocumentCreateFromTextRequest {
	dataset_id: string;
}

export interface IKnowledgeBaseDocumentCreateFromFileParams extends IDocumentCreateFromFileRequest {
	dataset_id: string;
	file: string; // Binary property name
}

export interface IKnowledgeBaseDocumentUpdateTextParams extends IDocumentUpdateTextRequest {
	dataset_id: string;
	document_id: string;
}

export interface IKnowledgeBaseDocumentUpdateFileParams {
	dataset_id: string;
	document_id: string;
	name?: string;
	file: string; // Binary property name
	process_rule?: {
		mode?: 'automatic' | 'custom';
		rules?: {
			pre_processing_rules?: Array<{
				id: string;
				enabled: boolean;
			}>;
			segmentation?: {
				separator: string;
				max_tokens: number;
			};
		};
	};
}

export interface IKnowledgeBaseDocumentGetParams {
	dataset_id: string;
	document_id: string;
}

export interface IKnowledgeBaseDocumentListParams {
	dataset_id: string;
	page?: number;
	limit?: number;
	sort?: 'created_at' | '-created_at' | 'position' | '-position';
	keyword?: string;
}

export interface IKnowledgeBaseDocumentDeleteParams {
	dataset_id: string;
	document_id: string;
}

export interface IKnowledgeBaseDocumentStatusParams {
	dataset_id: string;
	batch: string; // document IDs separated by comma
}

export interface IKnowledgeBaseSegmentListParams {
	dataset_id: string;
	document_id: string;
	page?: number;
	limit?: number;
	sort?: 'created_at' | '-created_at' | 'position' | '-position';
	keyword?: string;
}

export interface IKnowledgeBaseSegmentCreateParams extends ISegmentCreateRequest {
	dataset_id: string;
	document_id: string;
}

export interface IKnowledgeBaseSegmentGetParams {
	dataset_id: string;
	segment_id: string;
}

export interface IKnowledgeBaseSegmentUpdateParams extends ISegmentUpdateRequest {
	dataset_id: string;
	segment_id: string;
}

export interface IKnowledgeBaseSegmentDeleteParams {
	dataset_id: string;
	segment_id: string;
}

export interface IKnowledgeBaseSegmentChildrenParams {
	dataset_id: string;
	segment_id: string;
}

export interface IKnowledgeBaseSegmentCreateChildParams {
	dataset_id: string;
	segment_id: string;
	content: string;
	answer?: string;
	keywords?: string[];
}

export interface IKnowledgeBaseSegmentUpdateChildParams {
	dataset_id: string;
	segment_id: string;
	child_id: string;
	content?: string;
	answer?: string;
	keywords?: string[];
}

export interface IKnowledgeBaseSegmentDeleteChildParams {
	dataset_id: string;
	segment_id: string;
	child_id: string;
}

export interface IKnowledgeBaseTagListParams {
	dataset_id: string;
	page?: number;
	limit?: number;
}

export interface IKnowledgeBaseTagCreateParams extends ITagCreateRequest {
	dataset_id: string;
}

export interface IKnowledgeBaseTagUpdateParams extends ITagUpdateRequest {
	dataset_id: string;
	tag_id: string;
}

export interface IKnowledgeBaseTagDeleteParams {
	dataset_id: string;
	tag_id: string;
}

export interface IKnowledgeBaseTagBindParams extends ITagBindRequest {
	dataset_id: string;
	document_id: string;
}

export interface IKnowledgeBaseTagUnbindParams {
	dataset_id: string;
	document_id: string;
	tag_id: string;
}

export interface IKnowledgeBaseHitTestingParams extends IHitTestingRequest {
	dataset_id: string;
}