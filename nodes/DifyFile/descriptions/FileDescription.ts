import type { INodeProperties } from 'n8n-workflow';

// Operations for DifyFile node
export const fileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['file'],
			},
		},
		options: [
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a file to Dify for use in conversations',
				action: 'Upload a file',
			},
			{
				name: 'Preview',
				value: 'preview',
				description: 'Preview an uploaded file',
				action: 'Preview a file',
			},
			{
				name: 'Get Info',
				value: 'getInfo',
				description: 'Get information about an uploaded file',
				action: 'Get file information',
			},
		],
		default: 'upload',
	},
];

// Fields for file upload operation
export const fileFields: INodeProperties[] = [
	// Upload operation fields
	{
		displayName: 'File',
		name: 'binaryData',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['upload'],
			},
		},
		default: 'data',
		description: 'Name of the binary property containing the file data to upload. By default, "data" is used.',
	},
	{
		displayName: 'User',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['upload'],
			},
		},
		default: '',
		description: 'User identifier for the file upload. This helps track who uploaded the file.',
		placeholder: 'user123',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['upload'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'File Type',
				name: 'fileType',
				type: 'options',
				options: [
					{
						name: 'Audio',
						value: 'audio',
						description: 'Audio file (MP3, MP4, MPEG, M4A, WAV, WebM)',
					},
					{
						name: 'Auto Detect',
						value: 'auto',
						description: 'Automatically detect file type based on file extension and content',
					},
					{
						name: 'Document',
						value: 'document',
						description: 'Document file (PDF, DOC, DOCX, TXT, Markdown)',
					},
					{
						name: 'Image',
						value: 'image',
						description: 'Image file (PNG, JPG, JPEG, GIF, WebP)',
					},
					{
						name: 'Video',
						value: 'video',
						description: 'Video file (MP4, MOV, AVI, WebM)',
					},
				],
				default: 'auto',
				description: 'Type of file being uploaded. Leave as "Auto Detect" to let Dify determine the file type.',
			},
			{
				displayName: 'Max File Size (MB)',
				name: 'maxFileSize',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 15,
				description: 'Maximum file size allowed in MB. Default is 15MB.',
			},
			{
				displayName: 'Allowed Extensions',
				name: 'allowedExtensions',
				type: 'string',
				default: '',
				description: 'Comma-separated list of allowed file extensions (e.g., "pdf,docx,txt"). Leave empty to allow all supported extensions.',
				placeholder: 'pdf,docx,txt,jpg,png',
			},
		],
	},

	// Preview operation fields
	{
		displayName: 'File ID',
		name: 'fileId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['preview', 'getInfo'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the file to preview or get information about',
		placeholder: 'file-123abc',
	},
	{
		displayName: 'User',
		name: 'user',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['preview', 'getInfo'],
			},
		},
		default: '',
		required: true,
		description: 'User identifier who uploaded the file',
		placeholder: 'user123',
	},

	// Additional options for all operations
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['file'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Timeout (Seconds)',
				name: 'timeout',
				type: 'number',
				typeOptions: {
					minValue: 5,
					maxValue: 300,
				},
				default: 60,
				description: 'Maximum time to wait for file operation to complete',
			},
			{
				displayName: 'Return Binary Data',
				name: 'returnBinaryData',
				type: 'boolean',
				displayOptions: {
					show: {
						'/operation': ['preview'],
					},
				},
				default: false,
				description: 'Whether to return the file content as binary data in the response',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				displayOptions: {
					show: {
						'/operation': ['getInfo'],
					},
				},
				options: [
					{
						name: 'Standard',
						value: 'standard',
						description: 'Return standard file information (name, size, type, etc.)',
					},
					{
						name: 'Detailed',
						value: 'detailed',
						description: 'Return detailed information including upload metadata',
					},
					{
						name: 'Compact',
						value: 'compact',
						description: 'Return only essential file information',
					},
				],
				default: 'standard',
				description: 'Format of the returned file information',
			},
		],
	},
];

// Resource definition for DifyFile node
export const resource: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'File',
			value: 'file',
			description: 'Upload and manage files in Dify',
		},
	],
	default: 'file',
};

// Validation helpers specific to file operations
export const validateFileId = (fileId: string): boolean => {
	return /^file-[a-zA-Z0-9-]+$/.test(fileId) || /^[a-zA-Z0-9-]{8,}$/.test(fileId);
};

export const validateFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
	if (allowedExtensions.length === 0) {
		return true; // No restrictions
	}
	
	const extension = filename.split('.').pop()?.toLowerCase();
	return extension ? allowedExtensions.includes(extension) : false;
};

export const getSupportedFileTypes = (): Record<string, string[]> => {
	return {
		image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'],
		document: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'html'],
		audio: ['mp3', 'mp4', 'mpeg', 'm4a', 'wav', 'webm', 'aac', 'flac'],
		video: ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'],
	};
};

export const getMaxFileSizeByType = (fileType: string): number => {
	// Return max file size in MB
	const limits: Record<string, number> = {
		image: 10,      // 10 MB for images
		document: 50,   // 50 MB for documents
		audio: 100,     // 100 MB for audio
		video: 200,     // 200 MB for video
		auto: 15,       // 15 MB default
	};
	
	return limits[fileType] || limits.auto;
};