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

	// Test the credential by calling the health endpoint
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ $credentials.baseUrl }}',
			url: '/api/health',
			method: 'GET',
			headers: {
				'X-Token': '={{ $credentials.token }}',
			},
			qs: {
				token: '={{ $credentials.token }}',
			},
			timeout: 15000,
			json: true,
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'status',
					value: 'OK',
					message: 'HeadlessX API connection successful! Server is running and accessible.',
				},
			},
		],
	};
}
