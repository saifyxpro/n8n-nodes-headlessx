import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HeadlessXApi implements ICredentialType {
	name = 'headlessXApi';
	displayName = 'HeadlessX API';
	documentationUrl = 'https://github.com/SaifyXPRO/HeadlessX';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:3000',
			description: 'The base URL of your HeadlessX API server (without /api)',
			placeholder: 'http://localhost:3000',
		},
		{
			displayName: 'API Token',
			name: 'token',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			description: 'Your HeadlessX API authentication token',
			required: true,
		},
	];

	// HeadlessX supports multiple authentication methods for maximum compatibility
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Token': '={{ $credentials.token }}',
				'Authorization': '=Bearer {{ $credentials.token }}',
			},
			qs: {
				token: '={{ $credentials.token }}',
			},
		},
	};

	// Test the credential by calling the status endpoint which requires authentication
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ $credentials.baseUrl }}',
			url: '/api/status',
			method: 'GET',
			timeout: 20000,
			json: true,
			qs: {
				url: 'https://example.com',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'server.name',
					value: 'HeadlessX - Advanced Browserless Web Scraping API',
					message: 'HeadlessX API authentication successful! Token is valid and server status retrieved.',
				},
			},
		],
	};
}
