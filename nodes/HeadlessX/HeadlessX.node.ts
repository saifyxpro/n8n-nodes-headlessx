import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IBinaryData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class HeadlessX implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HeadlessX',
		name: 'headlessX',
		icon: 'file:headlessx.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with HeadlessX API for web scraping, screenshots, and PDF generation',
		defaults: {
			name: 'HeadlessX',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'headlessXApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// Operation selection
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Batch Process',
						value: 'batch',
						description: 'Process multiple URLs concurrently',
						action: 'Process batch',
					},
					{
						name: 'Extract HTML (GET)',
						value: 'htmlGet',
						description: 'Extract raw HTML from a webpage using GET request',
						action: 'Extract HTML via GET',
					},
					{
						name: 'Extract HTML (POST)',
						value: 'htmlPost',
						description: 'Extract raw HTML from a webpage using POST request with advanced options',
						action: 'Extract HTML via POST',
					},
					{
						name: 'Extract Text (GET)',
						value: 'contentGet',
						description: 'Extract clean text content from a webpage using GET request',
						action: 'Extract text via GET',
					},
					{
						name: 'Extract Text (POST)',
						value: 'contentPost',
						description: 'Extract clean text content from a webpage using POST request',
						action: 'Extract text via POST',
					},
					{
						name: 'Full Page Render',
						value: 'render',
						description: 'Render page with detailed options and metadata',
						action: 'Render full page',
					},
					{
						name: 'Generate PDF',
						value: 'pdf',
						description: 'Generate PDF from a webpage',
						action: 'Generate PDF',
					},
					{
						name: 'Health Check',
						value: 'health',
						description: 'Check API server health status',
						action: 'Check server health',
					},
					{
						name: 'Server Status',
						value: 'status',
						description: 'Get detailed server and browser status',
						action: 'Get server status',
					},
					{
						name: 'Take Screenshot',
						value: 'screenshot',
						description: 'Capture a screenshot of a webpage',
						action: 'Take screenshot',
					},
				],
				default: 'htmlGet',
			},

			// URL parameter for GET operations
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: 'https://example.com',
				description: 'The URL to process',
				displayOptions: {
					show: {
						operation: ['htmlGet', 'contentGet', 'screenshot', 'pdf', 'status'],
					},
				},
				required: true,
			},

			// Advanced options for GET operations
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['htmlGet', 'contentGet', 'screenshot', 'pdf'],
					},
				},
				options: [
					{
						displayName: 'Click Selectors',
						name: 'clickSelectors',
						type: 'string',
						default: '',
						placeholder: '.cookie-accept, .load-more',
						description: 'CSS selectors to click (comma-separated)',
					},
					{
						displayName: 'Extra Wait (Ms)',
						name: 'extraWait',
						type: 'number',
						default: 0,
						description: 'Additional wait time after page load',
					},
					{
						displayName: 'Include Console Logs',
						name: 'console',
						type: 'boolean',
						default: false,
						description: 'Whether to include browser console logs in response',
					},
					{
						displayName: 'Network Idle',
						name: 'networkIdle',
						type: 'boolean',
						default: false,
						description: 'Whether to wait for network to be idle',
					},
					{
						displayName: 'Remove Elements',
						name: 'removeElements',
						type: 'string',
						default: '',
						placeholder: '.ads, .popup',
						description: 'CSS selectors of elements to remove (comma-separated)',
					},
					{
						displayName: 'Return Partial on Timeout',
						name: 'returnPartial',
						type: 'boolean',
						default: false,
						description: 'Whether to return partial content if timeout occurs',
					},
					{
						displayName: 'Scroll to Bottom',
						name: 'scroll',
						type: 'boolean',
						default: false,
						description: 'Whether to scroll to the bottom of the page',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 30000,
						description: 'Navigation timeout in milliseconds',
					},
					{
						displayName: 'Wait for Selectors',
						name: 'waitForSelectors',
						type: 'string',
						default: '',
						placeholder: '.content, #main',
						description: 'CSS selectors to wait for (comma-separated)',
					},
					{
						displayName: 'Wait Until',
						name: 'waitUntil',
						type: 'options',
						options: [
							{ name: 'Load', value: 'load' },
							{ name: 'DOM Content Loaded', value: 'domcontentloaded' },
							{ name: 'Network Idle 0', value: 'networkidle0' },
							{ name: 'Network Idle 2', value: 'networkidle2' },
						],
						default: 'networkidle2',
						description: 'When to consider navigation finished',
					},
				],
			},

			// Screenshot specific options
			{
				displayName: 'Screenshot Options',
				name: 'screenshotOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['screenshot'],
					},
				},
				options: [
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [
							{ name: 'PNG', value: 'png' },
							{ name: 'JPEG', value: 'jpeg' },
							{ name: 'WebP', value: 'webp' },
						],
						default: 'png',
						description: 'Image format',
					},
					{
						displayName: 'Full Page',
						name: 'fullPage',
						type: 'boolean',
						default: false,
						description: 'Whether to capture full page screenshot',
					},
					{
						displayName: 'Height',
						name: 'height',
						type: 'number',
						default: 1080,
						description: 'Viewport height',
					},
					{
						displayName: 'Quality',
						name: 'quality',
						type: 'number',
						default: 80,
						description: 'Image quality (1-100, only for JPEG)',
					},
					{
						displayName: 'Width',
						name: 'width',
						type: 'number',
						default: 1920,
						description: 'Viewport width',
					},
				],
			},

			// PDF specific options
			{
				displayName: 'PDF Options',
				name: 'pdfOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['pdf'],
					},
				},
				options: [
					{
						displayName: 'Format',
						name: 'format',
						type: 'options',
						options: [
							{ name: 'A3', value: 'A3' },
							{ name: 'A4', value: 'A4' },
							{ name: 'A5', value: 'A5' },
							{ name: 'Legal', value: 'Legal' },
							{ name: 'Letter', value: 'Letter' },
							{ name: 'Tabloid', value: 'Tabloid' },
						],
						default: 'A4',
						description: 'Paper format',
					},
					{
						displayName: 'Landscape',
						name: 'landscape',
						type: 'boolean',
						default: false,
						description: 'Whether to generate PDF in landscape orientation',
					},
					{
						displayName: 'Print Background',
						name: 'background',
						type: 'boolean',
						default: true,
						description: 'Whether to include background graphics',
					},
					{
						displayName: 'Margin',
						name: 'margin',
						type: 'string',
						default: '1cm',
						description: 'Page margins (CSS format)',
					},
				],
			},

			// POST operations - URL and options in JSON body
			{
				displayName: 'URL',
				name: 'postUrl',
				type: 'string',
				default: '',
				placeholder: 'https://example.com',
				description: 'The URL to process',
				displayOptions: {
					show: {
						operation: ['htmlPost', 'contentPost', 'render'],
					},
				},
				required: true,
			},

			// Advanced POST options
			{
				displayName: 'Advanced Options',
				name: 'advancedOptions',
				type: 'json',
				default: '{}',
				description: 'Advanced options as JSON object',
				displayOptions: {
					show: {
						operation: ['htmlPost', 'contentPost', 'render'],
					},
				},
			},

			// Batch operation
			{
				displayName: 'URLs',
				name: 'batchUrls',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '["https://example.com"]',
				description: 'Array of URLs to process (JSON format)',
				displayOptions: {
					show: {
						operation: ['batch'],
					},
				},
				required: true,
			},

			{
				displayName: 'Batch Options',
				name: 'batchOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['batch'],
					},
				},
				options: [
					{
						displayName: 'Concurrency',
						name: 'concurrency',
						type: 'number',
						default: 5,
						description: 'Number of concurrent requests',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 30000,
						description: 'Timeout per URL',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				let responseData: any;
				let binaryData: IBinaryData | undefined;

				switch (operation) {
					case 'health':
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'GET',
								url: '/api/health',
								json: true,
							},
						);
						break;

					case 'status':
						const statusUrl = this.getNodeParameter('url', itemIndex) as string;
						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'GET',
								url: '/api/status',
								qs: { url: statusUrl },
								json: true,
							},
						);
						break;

					case 'htmlGet':
						const htmlUrl = this.getNodeParameter('url', itemIndex) as string;
						const htmlOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'GET',
								url: '/api/html',
								qs: { url: htmlUrl, ...htmlOptions },
								json: false, // Raw HTML response
							},
						);
						break;

					case 'htmlPost':
						const htmlPostUrl = this.getNodeParameter('postUrl', itemIndex) as string;
						const htmlAdvancedOptions = JSON.parse(this.getNodeParameter('advancedOptions', itemIndex, '{}') as string);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'POST',
								url: '/api/html',
								body: { url: htmlPostUrl, ...htmlAdvancedOptions },
								json: false, // Raw HTML response
							},
						);
						break;

					case 'contentGet':
						const contentUrl = this.getNodeParameter('url', itemIndex) as string;
						const contentOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'GET',
								url: '/api/content',
								qs: { url: contentUrl, ...contentOptions },
								json: false, // Plain text response
							},
						);
						break;

					case 'contentPost':
						const contentPostUrl = this.getNodeParameter('postUrl', itemIndex) as string;
						const contentAdvancedOptions = JSON.parse(this.getNodeParameter('advancedOptions', itemIndex, '{}') as string);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'POST',
								url: '/api/content',
								body: { url: contentPostUrl, ...contentAdvancedOptions },
								json: false, // Plain text response
							},
						);
						break;

					case 'screenshot':
						const screenshotUrl = this.getNodeParameter('url', itemIndex) as string;
						const screenshotGeneralOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;
						const screenshotSpecificOptions = this.getNodeParameter('screenshotOptions', itemIndex, {}) as IDataObject;

						// Set appropriate timeout for large screenshots (default: 60s)
						const screenshotTimeout = Number(screenshotGeneralOptions.timeout) || 60000;

						const screenshotBuffer = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'GET',
								url: '/api/screenshot',
								qs: { url: screenshotUrl, ...screenshotGeneralOptions, ...screenshotSpecificOptions },
								encoding: null, // Binary response
								timeout: screenshotTimeout,
							},
						);

						const screenshotFormat = screenshotSpecificOptions.format || 'png';
						const screenshotFileName = `screenshot_${Date.now()}.${screenshotFormat}`;

						binaryData = await this.helpers.prepareBinaryData(
							screenshotBuffer,
							screenshotFileName,
							`image/${screenshotFormat}`,
						);

						responseData = {
							success: true,
							filename: screenshotFileName,
							size: screenshotBuffer.length,
							format: screenshotFormat
						};
						break;

					case 'pdf':
						const pdfUrl = this.getNodeParameter('url', itemIndex) as string;
						const pdfGeneralOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as IDataObject;
						const pdfSpecificOptions = this.getNodeParameter('pdfOptions', itemIndex, {}) as IDataObject;

						// Set appropriate timeout for PDF generation (default: 90s)
						const pdfTimeout = Number(pdfGeneralOptions.timeout) || 90000;

						const pdfBuffer = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'GET',
								url: '/api/pdf',
								qs: { url: pdfUrl, ...pdfGeneralOptions, ...pdfSpecificOptions },
								encoding: null, // Binary response
								timeout: pdfTimeout,
							},
						);

						const pdfFileName = `document_${Date.now()}.pdf`;

						binaryData = await this.helpers.prepareBinaryData(
							pdfBuffer,
							pdfFileName,
							'application/pdf',
						);

						responseData = {
							success: true,
							filename: pdfFileName,
							size: pdfBuffer.length,
							pages: pdfSpecificOptions.format || 'A4'
						};
						break;

					case 'render':
						const renderUrl = this.getNodeParameter('postUrl', itemIndex) as string;
						const renderOptions = JSON.parse(this.getNodeParameter('advancedOptions', itemIndex, '{}') as string);

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'POST',
								url: '/api/render',
								body: { url: renderUrl, ...renderOptions },
								json: true,
							},
						);
						break;

					case 'batch':
						const batchUrls = JSON.parse(this.getNodeParameter('batchUrls', itemIndex) as string);
						const batchOptions = this.getNodeParameter('batchOptions', itemIndex, {}) as IDataObject;

						responseData = await this.helpers.requestWithAuthentication.call(
							this,
							'headlessXApi',
							{
								method: 'POST',
								url: '/api/batch',
								body: { urls: batchUrls, ...batchOptions },
								json: true,
							},
						);
						break;					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex,
						});
				}				const executionData: INodeExecutionData = {
					json: responseData,
					pairedItem: itemIndex,
				};

				if (binaryData) {
					executionData.binary = { data: binaryData };
				}

				returnData.push(executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: itemIndex,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error, { itemIndex });
				}
			}
		}

		return [returnData];
	}
}
