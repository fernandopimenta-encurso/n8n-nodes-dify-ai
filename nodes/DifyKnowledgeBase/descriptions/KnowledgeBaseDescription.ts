import type { INodeProperties } from 'n8n-workflow';

export const resource: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Dataset',
			value: 'dataset',
			description: 'Manage knowledge base datasets',
		},
		{
			name: 'Document',
			value: 'document',
			description: 'Manage documents within datasets',
		},
		{
			name: 'Segment',
			value: 'segment',
			description: 'Manage document segments (chunks)',
		},
		{
			name: 'Metadata',
			value: 'metadata',
			description: 'Manage dataset metadata and tags',
		},
	],
	default: 'dataset',
};

// Dataset Operations
export const datasetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dataset'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new dataset',
				action: 'Create dataset',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete dataset',
				action: 'Delete dataset',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get dataset details',
				action: 'Get dataset',
			},
			{
				name: 'Get Chunks',
				value: 'getChunks',
				description: 'Get dataset chunks with hit testing',
				action: 'Get dataset chunks',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all datasets',
				action: 'List datasets',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update dataset configuration',
				action: 'Update dataset',
			},
		],
		default: 'list',
	},
];

// Document Operations
export const documentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['document'],
			},
		},
		options: [
			{
				name: 'Create From File',
				value: 'createFromFile',
				description: 'Create document from uploaded file',
				action: 'Create document from file',
			},
			{
				name: 'Create From Text',
				value: 'createFromText',
				description: 'Create document from text content',
				action: 'Create document from text',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete document',
				action: 'Delete document',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get document details',
				action: 'Get document',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get document embedding status',
				action: 'Get document status',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List documents in dataset',
				action: 'List documents',
			},
			{
				name: 'Update File',
				value: 'updateFile',
				description: 'Update document with new file',
				action: 'Update document file',
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				description: 'Update document processing status',
				action: 'Update document status',
			},
			{
				name: 'Update Text',
				value: 'updateText',
				description: 'Update document with new text',
				action: 'Update document text',
			},
		],
		default: 'list',
	},
];

// Segment Operations
export const segmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['segment'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Add new segments to document',
				action: 'Add segments',
			},
			{
				name: 'Create Child',
				value: 'createChild',
				description: 'Create child segment',
				action: 'Create child segment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete segment',
				action: 'Delete segment',
			},
			{
				name: 'Delete Child',
				value: 'deleteChild',
				description: 'Delete child segment',
				action: 'Delete child segment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get segment details',
				action: 'Get segment',
			},
			{
				name: 'Get Children',
				value: 'getChildren',
				description: 'Get child segments',
				action: 'Get child segments',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List document segments',
				action: 'List segments',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update segment content',
				action: 'Update segment',
			},
			{
				name: 'Update Child',
				value: 'updateChild',
				description: 'Update child segment',
				action: 'Update child segment',
			},
		],
		default: 'list',
	},
];

// Metadata Operations
export const metadataOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['metadata'],
			},
		},
		options: [
			{
				name: 'Bind Tag',
				value: 'bindTag',
				description: 'Bind tag to document',
				action: 'Bind tag',
			},
			{
				name: 'Create Tag',
				value: 'createTag',
				description: 'Create new tag',
				action: 'Create tag',
			},
			{
				name: 'Delete Tag',
				value: 'deleteTag',
				action: 'Delete tag',
			},
			{
				name: 'Get Tags',
				value: 'getTags',
				description: 'Get all tags for dataset',
				action: 'Get tags',
			},
			{
				name: 'Unbind Tag',
				value: 'unbindTag',
				description: 'Unbind tag from document',
				action: 'Unbind tag',
			},
			{
				name: 'Update Tag',
				value: 'updateTag',
				description: 'Update tag properties',
				action: 'Update tag',
			},
		],
		default: 'getTags',
	},
];

// Dataset Fields
export const datasetFields: INodeProperties[] = [
	// Common dataset ID field for most operations
	{
		displayName: 'Dataset ID',
		name: 'datasetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dataset'],
				operation: ['get', 'update', 'delete', 'getChunks'],
			},
		},
		default: '',
		description: 'The ID of the dataset',
	},

	// List datasets fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['dataset'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
		],
	},

	// Create dataset fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dataset'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the dataset',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['dataset'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Dataset description',
			},
			{
				displayName: 'Embedding Model',
				name: 'embedding_model',
				type: 'string',
				default: '',
				description: 'Embedding model to use',
			},
			{
				displayName: 'Embedding Model Provider',
				name: 'embedding_model_provider',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Indexing Technique',
				name: 'indexing_technique',
				type: 'options',
				options: [
					{
						name: 'High Quality',
						value: 'high_quality',
					},
					{
						name: 'Economy',
						value: 'economy',
					},
				],
				default: 'high_quality',
				description: 'Indexing technique to use',
			},
			{
				displayName: 'Permission',
				name: 'permission',
				type: 'options',
				options: [
					{
						name: 'Only Me',
						value: 'only_me',
					},
					{
						name: 'All Team Members',
						value: 'all_team_members',
					},
				],
				default: 'only_me',
				description: 'Dataset access permission',
			},
			{
				displayName: 'Retrieval Model',
				name: 'retrieval_model',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				options: [
					{
						name: 'retrievalModelValue',
						displayName: 'Retrieval Model',
						values: [
							{
						displayName: 'Reranking Enable',
						name: 'reranking_enable',
						type: 'boolean',
						default: false,
						description: 'Whether to enable reranking',
							},
							{
						displayName: 'Score Threshold',
						name: 'score_threshold',
						type: 'number',
						default: 0.5,
						description: 'Minimum score threshold',
							},
							{
						displayName: 'Score Threshold Enabled',
						name: 'score_threshold_enabled',
						type: 'boolean',
						default: false,
						description: 'Whether to enable score threshold filtering',
							},
							{
						displayName: 'Search Method',
						name: 'search_method',
						type: 'options',
						options: [
									{
										name: 'Semantic Search',
										value: 'semantic_search',
									},
									{
										name: 'Full Text Search',
										value: 'full_text_search',
									},
									{
										name: 'Hybrid Search',
										value: 'hybrid_search',
									},
								],
						default: 'semantic_search',
						description: 'Search method to use',
							},
							{
						displayName: 'Top K',
						name: 'top_k',
						type: 'number',
						default: 4,
						description: 'Number of top results to return',
							},
					],
					},
				],
			},
		],
	},

	// Get chunks fields
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dataset'],
				operation: ['getChunks'],
			},
		},
		default: '',
		description: 'Query text for hit testing',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['dataset'],
				operation: ['getChunks'],
			},
		},
		options: [
			{
				displayName: 'Search Method',
				name: 'search_method',
				type: 'options',
				options: [
					{
						name: 'Semantic Search',
						value: 'semantic_search',
					},
					{
						name: 'Full Text Search',
						value: 'full_text_search',
					},
					{
						name: 'Hybrid Search',
						value: 'hybrid_search',
					},
				],
				default: 'semantic_search',
				description: 'Search method to use',
			},
			{
				displayName: 'Top K',
				name: 'top_k',
				type: 'number',
				default: 4,
				description: 'Number of top results to return',
			},
			{
				displayName: 'Score Threshold Enabled',
				name: 'score_threshold_enabled',
				type: 'boolean',
				default: false,
				description: 'Whether to enable score threshold filtering',
			},
			{
				displayName: 'Score Threshold',
				name: 'score_threshold',
				type: 'number',
				default: 0.5,
				displayOptions: {
					show: {
						score_threshold_enabled: [true],
					},
				},
				description: 'Minimum score threshold',
			},
		],
	},
];

// Document Fields
export const documentFields: INodeProperties[] = [
	// Common dataset ID field for all document operations
	{
		displayName: 'Dataset ID',
		name: 'datasetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
			},
		},
		default: '',
		description: 'The ID of the dataset',
	},

	// Document ID field for operations that need it
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['updateText', 'updateFile', 'get', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the document',
	},

	// Batch field for status operation
	{
		displayName: 'Document IDs',
		name: 'batch',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['getStatus', 'updateStatus'],
			},
		},
		default: '',
		description: 'Comma-separated list of document IDs',
	},

	// Text content for text-based operations
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromText'],
			},
		},
		default: '',
		description: 'Document name',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromText', 'updateText'],
			},
		},
		default: '',
		description: 'Document text content',
	},

	// File input for file-based operations
	{
		displayName: 'Input Binary Field',
		name: 'file',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromFile', 'updateFile'],
			},
		},
		default: 'data',
		description: 'Name of the binary property containing the file',
	},

	// List documents fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{
						name: 'Created At (Ascending)',
						value: 'created_at',
					},
					{
						name: 'Created At (Descending)',
						value: '-created_at',
					},
					{
						name: 'Position (Ascending)',
						value: 'position',
					},
					{
						name: 'Position (Descending)',
						value: '-position',
					},
				],
				default: '-created_at',
				description: 'Sort order',
			},
			{
				displayName: 'Keyword',
				name: 'keyword',
				type: 'string',
				default: '',
				description: 'Filter by keyword',
			},
		],
	},

	// Common additional fields for document operations
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['createFromText', 'createFromFile', 'updateText', 'updateFile'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/operation': ['createFromFile', 'updateText', 'updateFile'],
					},
				},
				description: 'Document name (optional for file operations)',
			},
			{
				displayName: 'Indexing Technique',
				name: 'indexing_technique',
				type: 'options',
				options: [
					{
						name: 'High Quality',
						value: 'high_quality',
					},
					{
						name: 'Economy',
						value: 'economy',
					},
				],
				default: 'high_quality',
				description: 'Indexing technique to use',
			},
			{
				displayName: 'Process Rule',
				name: 'process_rule',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				options: [
					{
						name: 'processRuleValue',
						displayName: 'Process Rule',
						values: [
							{
								displayName: 'Mode',
								name: 'mode',
								type: 'options',
								options: [
									{
										name: 'Automatic',
										value: 'automatic',
									},
									{
										name: 'Custom',
										value: 'custom',
									},
								],
								default: 'automatic',
								description: 'Processing mode',
							},
							{
								displayName: 'Pre-Processing Rules',
								name: 'pre_processing_rules',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
								},
								default: {},
								displayOptions: {
									show: {
										mode: ['custom'],
									},
								},
								options: [
									{
										name: 'ruleValue',
										displayName: 'Rule',
										values: [
											{
												displayName: 'ID',
												name: 'id',
												type: 'string',
												default: '',
												description: 'Pre-processing rule ID',
											},
											{
												displayName: 'Enabled',
												name: 'enabled',
												type: 'boolean',
												default: true,
												description: 'Whether to enable this rule',
											},
										],
									},
								],
							},
							{
								displayName: 'Segmentation',
								name: 'segmentation',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: false,
								},
								default: {},
								displayOptions: {
									show: {
										mode: ['custom'],
									},
								},
								options: [
									{
										name: 'segmentationValue',
										displayName: 'Segmentation',
										values: [
											{
												displayName: 'Separator',
												name: 'separator',
												type: 'string',
												default: '\n\n',
												description: 'Text separator for segmentation',
											},
											{
												displayName: 'Max Tokens',
												name: 'max_tokens',
												type: 'number',
												default: 500,
												description: 'Maximum tokens per segment',
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
];

// Segment Fields
export const segmentFields: INodeProperties[] = [
	// Common dataset ID field for all segment operations
	{
		displayName: 'Dataset ID',
		name: 'datasetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['segment'],
			},
		},
		default: '',
		description: 'The ID of the dataset',
	},

	// Document ID field for segment operations
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['list', 'add'],
			},
		},
		default: '',
		description: 'The ID of the document',
	},

	// Segment ID field for operations that need it
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['get', 'update', 'delete', 'getChildren', 'createChild', 'updateChild', 'deleteChild'],
			},
		},
		default: '',
		description: 'The ID of the segment',
	},

	// Child ID field for child segment operations
	{
		displayName: 'Child ID',
		name: 'childId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['updateChild', 'deleteChild'],
			},
		},
		default: '',
		description: 'The ID of the child segment',
	},

	// List segments fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{
						name: 'Created At (Ascending)',
						value: 'created_at',
					},
					{
						name: 'Created At (Descending)',
						value: '-created_at',
					},
					{
						name: 'Position (Ascending)',
						value: 'position',
					},
					{
						name: 'Position (Descending)',
						value: '-position',
					},
				],
				default: '-created_at',
				description: 'Sort order',
			},
			{
				displayName: 'Keyword',
				name: 'keyword',
				type: 'string',
				default: '',
				description: 'Filter by keyword',
			},
		],
	},

	// Add segments fields
	{
		displayName: 'Segments',
		name: 'segments',
		type: 'fixedCollection',
		required: true,
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['add'],
			},
		},
		default: {},
		options: [
			{
				name: 'segmentValue',
				displayName: 'Segment',
				values: [
					{
						displayName: 'Content',
						name: 'content',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Segment content',
					},
					{
						displayName: 'Answer',
						name: 'answer',
						type: 'string',
						typeOptions: {
							rows: 2,
						},
						default: '',
						description: 'Segment answer (for Q&A format)',
					},
					{
						displayName: 'Keywords',
						name: 'keywords',
						type: 'string',
						default: '',
						description: 'Comma-separated keywords',
					},
				],
			},
		],
	},

	// Update/Create segment content fields
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['update', 'createChild'],
			},
		},
		default: '',
		description: 'Segment content',
	},

	// Additional fields for update and create child operations
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['update', 'createChild', 'updateChild'],
			},
		},
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						'/operation': ['updateChild'],
					},
				},
				description: 'Segment content',
			},
			{
				displayName: 'Answer',
				name: 'answer',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				description: 'Segment answer (for Q&A format)',
			},
			{
				displayName: 'Keywords',
				name: 'keywords',
				type: 'string',
				default: '',
				description: 'Comma-separated keywords',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						'/operation': ['update'],
					},
				},
				description: 'Whether to enable/disable segment',
			},
		],
	},
];

// Metadata Fields
export const metadataFields: INodeProperties[] = [
	// Common dataset ID field for all metadata operations
	{
		displayName: 'Dataset ID',
		name: 'datasetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['metadata'],
			},
		},
		default: '',
		description: 'The ID of the dataset',
	},

	// Tag ID field for operations that need it
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['metadata'],
				operation: ['updateTag', 'deleteTag', 'unbindTag'],
			},
		},
		default: '',
		description: 'The ID of the tag',
	},

	// Document ID field for bind/unbind operations
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['metadata'],
				operation: ['bindTag', 'unbindTag'],
			},
		},
		default: '',
		description: 'The ID of the document',
	},

	// Get tags fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['metadata'],
				operation: ['getTags'],
			},
		},
		options: [
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
		],
	},

	// Create tag fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['metadata'],
				operation: ['createTag'],
			},
		},
		default: '',
		description: 'Tag name',
	},

	// Tag fields for create and update
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['metadata'],
				operation: ['createTag', 'updateTag'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						'/operation': ['updateTag'],
					},
				},
				description: 'Tag name',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#1890ff',
				description: 'Tag color (hex code)',
			},
		],
	},

	// Bind tag fields
	{
		displayName: 'Tag IDs',
		name: 'tagIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['metadata'],
				operation: ['bindTag'],
			},
		},
		default: '',
		description: 'Comma-separated list of tag IDs to bind',
	},
];

// All fields combined
export const knowledgeBaseFields: INodeProperties[] = [
	...datasetFields,
	...documentFields,
	...segmentFields,
	...metadataFields,
];

// All operations combined
export const knowledgeBaseOperations: INodeProperties[] = [
	...datasetOperations,
	...documentOperations,
	...segmentOperations,
	...metadataOperations,
];