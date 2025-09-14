import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError, NodeApiError } from 'n8n-workflow';

import { properties } from './HeadlessX.properties';
import { methods } from './HeadlessX.methods';

import * as html from './resources/html';
import * as content from './resources/content';
import * as screenshot from './resources/screenshot';
import * as pdf from './resources/pdf';
import * as render from './resources/render';
import * as batch from './resources/batch';

export class HeadlessX implements INodeType {
	methods = methods;
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
			baseURL: '={{ $credentials.baseUrl }}',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			let operation = 'unknown';
			try {
				operation = this.getNodeParameter('operation', itemIndex) as string;

				let results: INodeExecutionData[] = [];

				// Route operations to their respective resource modules
				switch (operation) {
					case 'htmlGet':
					case 'htmlPost':
						results = await html.execute.call(this, itemIndex);
						break;
					case 'contentGet':
					case 'contentPost':
						results = await content.execute.call(this, itemIndex);
						break;
					case 'screenshot':
						results = await screenshot.execute.call(this, itemIndex);
						break;
					case 'pdf':
						results = await pdf.execute.call(this, itemIndex);
						break;
					case 'render':
						results = await render.execute.call(this, itemIndex);
						break;
					case 'batch':
						results = await batch.execute.call(this, itemIndex);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex });
				}

				// Apply execution metadata and add to return data
				const executionData = this.helpers.constructExecutionMetaData(results, { itemData: { item: itemIndex } });
				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					const errorData: INodeExecutionData = {
						json: {
							error: (error as Error).message,
							operation: operation,
							timestamp: new Date().toISOString()
						},
						pairedItem: { item: itemIndex }
					};
					returnData.push(errorData);
				} else {
					const e: any = error;
					// Enrich error to aid debugging (similar to browserless)
					const credentials = (await this.getCredentials('headlessXApi')) as IDataObject;
					const baseURL = (credentials?.baseUrl as string) || '';

					const details = {
						...e,
						request: e?.cause?.request
							? {
								path: e?.cause?.request?.path,
								_headers: e?.cause?.request?._headers,
							}
							: undefined,
						response: e?.cause?.response
							? {
								status: e?.cause?.response?.status,
								data: e?.cause?.response?.data,
							}
							: undefined,
						config: e?.cause?.config
							? {
								baseURL: e?.cause?.config?.baseURL ?? baseURL,
								url: e?.cause?.config?.url,
								method: e?.cause?.config?.method,
							}
							: { baseURL, url: undefined, method: undefined },
						message: e?.message,
					};
					throw new NodeApiError(this.getNode(), details, { itemIndex });
				}
			}
		}

		return this.prepareOutputData(returnData);
	}
}
