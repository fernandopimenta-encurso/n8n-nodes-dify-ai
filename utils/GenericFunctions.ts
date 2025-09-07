import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	IPollFunctions,
	ITriggerFunctions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';

import type {
	IDifyApiError,
	IDifyRequestOptions,
	StreamResponseCallback,
} from './types';

/**
 * Make an API request to Dify
 */
export async function difyApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions | ITriggerFunctions | IWebhookFunctions,
	options: IDifyRequestOptions,
): Promise<any> {
	const credentials = await this.getCredentials('difyApi');
	const baseUrl = credentials.baseUrl as string;
	const apiKey = credentials.apiKey as string;

	// Ensure base URL ends with /v1
	const normalizedBaseUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

	const requestOptions: IHttpRequestOptions = {
		method: options.method,
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': options.encoding === 'form' ? 'multipart/form-data' : 'application/json',
			...options.headers,
		},
		url: `${normalizedBaseUrl}${options.endpoint}`,
		json: options.encoding !== 'form',
		timeout: options.timeout || 30000,
		returnFullResponse: options.returnFullResponse || false,
	};

	// Add query parameters
	if (options.query) {
		requestOptions.qs = options.query;
	}

	// Add body for non-GET requests
	if (options.body && options.method !== 'GET') {
		if (options.encoding === 'form') {
			requestOptions.body = options.body;
			requestOptions.headers!['Content-Type'] = 'multipart/form-data';
		} else {
			requestOptions.body = options.body;
		}
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'difyApi', requestOptions);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Handle paginated API requests
 */
export async function difyApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	options: IDifyRequestOptions,
	limit?: number,
): Promise<any[]> {
	const returnData: IDataObject[] = [];
	
	let page = 1;
	const pageLimit = limit || 100;
	
	// Add pagination parameters
	options.query = {
		...options.query,
		page,
		limit: pageLimit,
	};

	do {
		options.query.page = page;
		const responseData = await difyApiRequest.call(this, options);
		
		if (responseData[propertyName]) {
			returnData.push.apply(returnData, responseData[propertyName] as IDataObject[]);
		}
		
		// Check if there are more items
		if (!responseData.has_more || (limit && returnData.length >= limit)) {
			break;
		}
		
		page++;
	} while (true);

	// Return only the requested number of items if limit is specified
	return limit ? returnData.slice(0, limit) : returnData;
}

/**
 * Handle streaming responses from Dify API
 */
export async function handleStreamResponse(
	this: IExecuteFunctions,
	options: IDifyRequestOptions,
	callback: StreamResponseCallback,
): Promise<void> {
	const credentials = await this.getCredentials('difyApi');
	const baseUrl = credentials.baseUrl as string;
	const apiKey = credentials.apiKey as string;

	const normalizedBaseUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;

	return new Promise((resolve, reject) => {
		const requestOptions: IHttpRequestOptions = {
			method: options.method,
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				'Accept': 'text/event-stream',
				...options.headers,
			},
			url: `${normalizedBaseUrl}${options.endpoint}`,
			body: options.body,
			json: true,
		};

		this.helpers.httpRequest(requestOptions)
			.then((response) => {
				if (typeof response === 'string') {
					// Handle Server-Sent Events (SSE) format
					const lines = response.split('\n');
					
					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6).trim();
							
							if (data === '[DONE]') {
								resolve();
								return;
							}
							
							try {
								const parsed = JSON.parse(data);
								callback(parsed);
							} catch (error) {
								// Skip invalid JSON lines
								continue;
							}
						}
					}
				} else {
					// Handle regular JSON response
					callback(response as string);
				}
				resolve();
			})
			.catch((error) => {
				reject(new NodeApiError(this.getNode(), error as JsonObject));
			});
	});
}

/**
 * Prepare file upload for multipart form data
 */
export function prepareFileUpload(
	files: Array<{
		name: string;
		data: Buffer;
		mimeType: string;
	}>,
): IDataObject {
	const formData: IDataObject = {};
	
	files.forEach((file, index) => {
		formData[`file${index}`] = {
			value: file.data,
			options: {
				filename: file.name,
				contentType: file.mimeType,
			},
		};
	});
	
	return formData;
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string): boolean {
	// Dify API keys typically start with 'app-' followed by 32 characters
	return /^app-[a-zA-Z0-9]{32}$/.test(apiKey);
}

/**
 * Format Dify API errors for user-friendly display
 */
export function formatDifyError(error: any): IDifyApiError {
	if (error.response?.body) {
		const body = error.response.body;
		
		return {
			name: 'DifyApiError',
			message: body.message || body.detail || 'Unknown Dify API error',
			httpCode: body.code || error.response.statusCode?.toString(),
			description: body.message || body.detail,
		};
	}
	
	return {
		name: 'DifyApiError',
		message: error.message || 'Unknown error occurred',
		httpCode: error.statusCode?.toString(),
		description: error.message,
	};
}

/**
 * Sanitize user inputs to prevent injection attacks
 */
export function sanitizeInput(input: any): any {
	if (typeof input === 'string') {
		return input.replace(/[<>&'"]/g, '');
	}
	
	if (Array.isArray(input)) {
		return input.map(sanitizeInput);
	}
	
	if (input && typeof input === 'object') {
		const sanitized: IDataObject = {};
		for (const [key, value] of Object.entries(input)) {
			sanitized[key] = sanitizeInput(value);
		}
		return sanitized;
	}
	
	return input;
}

/**
 * Build conversation context from previous messages
 */
export function buildConversationContext(
	executionData: INodeExecutionData[],
	maxMessages: number = 10,
): Array<{ role: 'user' | 'assistant'; content: string }> {
	const context: Array<{ role: 'user' | 'assistant'; content: string }> = [];
	
	// Take the last N messages to build context
	const recentData = executionData.slice(-maxMessages * 2);
	
	recentData.forEach((data) => {
		const json = data.json;
		
		if (json.query && typeof json.query === 'string') {
			context.push({
				role: 'user',
				content: json.query,
			});
		}
		
		if (json.response && typeof json.response === 'string') {
			context.push({
				role: 'assistant',
				content: json.response,
			});
		}
	});
	
	return context.slice(-maxMessages);
}

/**
 * Parse Server-Sent Events (SSE) stream
 */
export function parseSSEStream(chunk: string): any[] {
	const events: any[] = [];
	const lines = chunk.split('\n');
	
	let currentEvent: any = {};
	
	for (const line of lines) {
		const trimmed = line.trim();
		
		if (trimmed === '') {
			// Empty line indicates end of event
			if (Object.keys(currentEvent).length > 0) {
				events.push(currentEvent);
				currentEvent = {};
			}
			continue;
		}
		
		if (trimmed.startsWith('data: ')) {
			const data = trimmed.slice(6);
			
			if (data === '[DONE]') {
				break;
			}
			
			try {
				currentEvent = JSON.parse(data);
			} catch (error) {
				// Skip invalid JSON
				continue;
			}
		} else if (trimmed.startsWith('event: ')) {
			currentEvent.event = trimmed.slice(7);
		} else if (trimmed.startsWith('id: ')) {
			currentEvent.id = trimmed.slice(4);
		} else if (trimmed.startsWith('retry: ')) {
			currentEvent.retry = parseInt(trimmed.slice(7), 10);
		}
	}
	
	// Add the last event if it exists
	if (Object.keys(currentEvent).length > 0) {
		events.push(currentEvent);
	}
	
	return events;
}

/**
 * Retry failed requests with exponential backoff
 */
export async function retryApiRequest<T>(
	request: () => Promise<T>,
	maxRetries: number = 3,
	baseDelay: number = 1000,
): Promise<T> {
	let lastError: Error;
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await request();
		} catch (error) {
			lastError = error as Error;
			
			// Don't retry on client errors (4xx) except 429 (rate limit)
			if (error instanceof NodeApiError) {
				const statusCode = error.httpCode;
				if (statusCode && statusCode.startsWith('4') && statusCode !== '429') {
					throw error;
				}
			}
			
			if (attempt === maxRetries) {
				break;
			}
			
			// Exponential backoff with jitter
			const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
	
	throw lastError!;
}

/**
 * Check if response is a streaming response
 */
export function isStreamingResponse(response: any): boolean {
	return typeof response === 'string' && 
		(response.includes('data: ') || response.includes('event: '));
}

/**
 * Extract file information from n8n binary data
 */
export function extractFileInfo(binaryData: any): {
	name: string;
	data: Buffer;
	mimeType: string;
	size: number;
} {
	return {
		name: binaryData.fileName || 'unnamed_file',
		data: binaryData.data,
		mimeType: binaryData.mimeType || 'application/octet-stream',
		size: binaryData.data.length,
	};
}

/**
 * Validate file upload requirements
 */
export function validateFileUpload(
	file: { name: string; size: number; mimeType: string },
	allowedTypes: string[] = [],
	maxSize: number = 10 * 1024 * 1024, // 10MB default
): { valid: boolean; error?: string } {
	// Check file size
	if (file.size > maxSize) {
		return {
			valid: false,
			error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
		};
	}
	
	// Check file type if restrictions are specified
	if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimeType)) {
		return {
			valid: false,
			error: `File type ${file.mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
		};
	}
	
	return { valid: true };
}