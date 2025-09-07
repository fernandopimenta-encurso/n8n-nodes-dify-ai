import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DifyApi implements ICredentialType {
	name = 'difyApi';

	displayName = 'Dify API';

	documentationUrl = 'https://docs.dify.ai/api-reference';

	icon = 'file:Dify.svg' as const;

	httpRequestNode = {
		name: 'Dify',
		docsUrl: 'https://docs.dify.ai/api-reference',
		apiBaseUrl: '',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.dify.ai/v1',
			required: true,
			description:
				'The base URL of your Dify instance. For Dify Cloud, use https://api.dify.ai/v1. For self-hosted instances, use your custom URL.',
			placeholder: 'https://api.dify.ai/v1',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'The API key for your Dify application. You can find this in your Dify application settings under API Access.',
			placeholder: 'app-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/parameters',
			method: 'GET',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'opening_statement',
					value: 'opening_statement',
					message: 'Invalid API key or base URL',
				},
			},
		],
	};
}