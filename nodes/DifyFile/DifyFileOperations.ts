import type {
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

import {
	difyApiRequest,
	validateFileUpload,
	extractFileInfo,
	prepareFileUpload,
	retryApiRequest,
} from '../../utils/GenericFunctions';

import {
	validateFileId,
	validateFileExtension,
	getSupportedFileTypes,
	getMaxFileSizeByType,
} from './descriptions/FileDescription';

/**
 * Upload a file to Dify
 */
export async function uploadFile(context: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData> {
	const binaryPropertyName = context.getNodeParameter('binaryData', itemIndex, 'data') as string;
	const user = context.getNodeParameter('user', itemIndex) as string;
	
	// Get options
	const options = context.getNodeParameter('options', itemIndex, {}) as IDataObject;
	const fileType = options.fileType as string || 'auto';
	const maxFileSize = (options.maxFileSize as number || 15) * 1024 * 1024; // Convert to bytes
	const allowedExtensionsStr = options.allowedExtensions as string || '';
	const allowedExtensions = allowedExtensionsStr ? allowedExtensionsStr.split(',').map(ext => ext.trim().toLowerCase()) : [];
	
	// Get additional options
	const additionalOptions = context.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;
	const timeout = (additionalOptions.timeout as number) * 1000 || 60000;

	// Get binary data
	const binaryData = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const fileInfo = extractFileInfo(binaryData);

	// Validate file extension if restrictions are specified
	if (!validateFileExtension(fileInfo.name, allowedExtensions)) {
		throw new NodeOperationError(
			context.getNode(),
			`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
			{ itemIndex },
		);
	}

	// Validate file size
	const actualMaxSize = Math.min(maxFileSize, getMaxFileSizeByType(fileType) * 1024 * 1024);
	const validation = validateFileUpload(fileInfo, [], actualMaxSize);
	
	if (!validation.valid) {
		throw new NodeOperationError(context.getNode(), validation.error!, { itemIndex });
	}

	// Validate file type if not auto-detect
	if (fileType !== 'auto') {
		const supportedTypes = getSupportedFileTypes();
		const extension = fileInfo.name.split('.').pop()?.toLowerCase();
		
		if (extension && !supportedTypes[fileType]?.includes(extension)) {
			throw new NodeOperationError(
				context.getNode(),
				`File type ${extension} is not supported for ${fileType} files. Supported types: ${supportedTypes[fileType]?.join(', ')}`,
				{ itemIndex },
			);
		}
	}

	// Prepare multipart form data
	const formData = prepareFileUpload([fileInfo]);
	
	// Add user to form data
	if (user) {
		formData.user = user;
	}

	try {
		const responseData = await retryApiRequest(async () => {
			return await difyApiRequest.call(context, {
				method: 'POST',
				endpoint: '/files/upload',
				body: formData,
				encoding: 'form',
				timeout,
			});
		});

		// Process and return response
		const result: IDataObject = {
			success: true,
			file: {
				id: responseData.id,
				name: responseData.name || fileInfo.name,
				size: responseData.size || fileInfo.size,
				extension: responseData.extension || fileInfo.name.split('.').pop(),
				mime_type: responseData.mime_type || fileInfo.mimeType,
				created_by: responseData.created_by || user,
				created_at: responseData.created_at || Date.now(),
				url: responseData.url,
			},
			upload_metadata: {
				original_filename: fileInfo.name,
				original_size: fileInfo.size,
				original_mime_type: fileInfo.mimeType,
				file_type_detected: fileType === 'auto' ? detectFileType(fileInfo.name, fileInfo.mimeType) : fileType,
				validation_passed: true,
			},
		};

		return {
			json: result,
			pairedItem: { item: itemIndex },
		};
		
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`Failed to upload file: ${error.message}`,
			{ itemIndex },
		);
	}
}

/**
 * Preview an uploaded file
 */
export async function previewFile(context: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData> {
	const fileId = context.getNodeParameter('fileId', itemIndex) as string;
	const user = context.getNodeParameter('user', itemIndex) as string;
	
	// Get additional options
	const additionalOptions = context.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;
	const timeout = (additionalOptions.timeout as number) * 1000 || 60000;
	const returnBinaryData = additionalOptions.returnBinaryData as boolean || false;

	// Validate file ID format
	if (!validateFileId(fileId)) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid file ID format: ${fileId}`,
			{ itemIndex },
		);
	}

	// Prepare query parameters
	const query: IDataObject = {};
	if (user) {
		query.user = user;
	}

	try {
		const responseData = await retryApiRequest(async () => {
			return await difyApiRequest.call(context, {
				method: 'GET',
				endpoint: `/files/${fileId}/preview`,
				query,
				timeout,
				returnFullResponse: returnBinaryData,
			});
		});

		const result: INodeExecutionData = {
			json: {
				success: true,
				file_id: fileId,
				preview: responseData,
			},
			pairedItem: { item: itemIndex },
		};

		// Handle binary data if requested
		if (returnBinaryData && responseData.body) {
			const filename = `preview_${fileId}`;
			const mimeType = responseData.headers['content-type'] || 'application/octet-stream';
			
			result.binary = {
				data: {
					data: responseData.body,
					mimeType,
					fileName: filename,
				},
			};
		}

		return result;
		
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`Failed to preview file: ${error.message}`,
			{ itemIndex },
		);
	}
}

/**
 * Get information about an uploaded file
 */
export async function getFileInfo(context: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData> {
	const fileId = context.getNodeParameter('fileId', itemIndex) as string;
	const user = context.getNodeParameter('user', itemIndex) as string;
	
	// Get additional options
	const additionalOptions = context.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;
	const timeout = (additionalOptions.timeout as number) * 1000 || 60000;
	const outputFormat = additionalOptions.outputFormat as string || 'standard';

	// Validate file ID format
	if (!validateFileId(fileId)) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid file ID format: ${fileId}`,
			{ itemIndex },
		);
	}

	// Prepare query parameters
	const query: IDataObject = {};
	if (user) {
		query.user = user;
	}

	try {
		const responseData = await retryApiRequest(async () => {
			return await difyApiRequest.call(context, {
				method: 'GET',
				endpoint: `/files/${fileId}`,
				query,
				timeout,
			});
		});

		// Format response based on requested output format
		let formattedResponse: IDataObject;
		
		switch (outputFormat) {
			case 'compact':
				formattedResponse = {
					id: responseData.id,
					name: responseData.name,
					size: responseData.size,
					type: responseData.mime_type,
				};
				break;
				
			case 'detailed':
				formattedResponse = {
					...responseData,
					file_info: {
						size_formatted: formatFileSize(responseData.size),
						type_category: detectFileType(responseData.name, responseData.mime_type),
						is_image: isImageFile(responseData.mime_type),
						is_document: isDocumentFile(responseData.mime_type),
						is_audio: isAudioFile(responseData.mime_type),
						is_video: isVideoFile(responseData.mime_type),
					},
					upload_info: {
						uploaded_at: new Date(responseData.created_at * 1000).toISOString(),
						uploaded_by: responseData.created_by,
						time_since_upload: Date.now() - (responseData.created_at * 1000),
					},
				};
				break;
				
			default: // 'standard'
				formattedResponse = {
					id: responseData.id,
					name: responseData.name,
					size: responseData.size,
					size_formatted: formatFileSize(responseData.size),
					extension: responseData.extension,
					mime_type: responseData.mime_type,
					type_category: detectFileType(responseData.name, responseData.mime_type),
					created_by: responseData.created_by,
					created_at: responseData.created_at,
					url: responseData.url,
				};
		}

		return {
			json: {
				success: true,
				file_id: fileId,
				file_info: formattedResponse,
			},
			pairedItem: { item: itemIndex },
		};
		
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`Failed to get file information: ${error.message}`,
			{ itemIndex },
		);
	}
}

// Utility Functions

/**
 * Detect file type based on filename and mime type
 */
function detectFileType(filename: string, mimeType: string): string {
	const extension = filename.split('.').pop()?.toLowerCase();
	const supportedTypes = getSupportedFileTypes();
	
	// Check by mime type first
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType.startsWith('audio/')) return 'audio';
	if (mimeType.startsWith('video/')) return 'video';
	if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
	
	// Check by extension
	for (const [type, extensions] of Object.entries(supportedTypes)) {
		if (extension && extensions.includes(extension)) {
			return type;
		}
	}
	
	return 'document'; // Default fallback
}

/**
 * Check if file is an image
 */
function isImageFile(mimeType: string): boolean {
	return mimeType.startsWith('image/');
}

/**
 * Check if file is a document
 */
function isDocumentFile(mimeType: string): boolean {
	return mimeType.includes('pdf') || 
		   mimeType.includes('document') || 
		   mimeType.includes('text') ||
		   mimeType.includes('rtf') ||
		   mimeType.includes('html');
}

/**
 * Check if file is audio
 */
function isAudioFile(mimeType: string): boolean {
	return mimeType.startsWith('audio/');
}

/**
 * Check if file is video
 */
function isVideoFile(mimeType: string): boolean {
	return mimeType.startsWith('video/');
}

/**
 * Format file size for human reading
 */
function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}