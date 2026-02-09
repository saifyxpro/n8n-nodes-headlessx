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
import * as htmlJs from './resources/htmlJs';
import * as content from './resources/content';
import * as screenshot from './resources/screenshot';
import * as googleSerp from './resources/googleSerp';
import * as profile from './resources/profile';
import * as proxy from './resources/proxy';

export class HeadlessX implements INodeType {
	methods = methods;
	description: INodeTypeDescription = {
		displayName: 'HeadlessX',
		name: 'headlessX',
		icon: 'file:headlessx.svg',
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Anti-detection web scraping with HeadlessX v2 API',
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

		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			let resource = 'unknown';
			let operation = 'unknown';
			try {
				resource = this.getNodeParameter('resource', itemIndex) as string;
				operation = this.getNodeParameter('operation', itemIndex) as string;

				let results: INodeExecutionData[] = [];

				if (resource === 'website') {
					if (operation === 'html') results = await html.execute.call(this, itemIndex);
					else if (operation === 'htmlJs') results = await htmlJs.execute.call(this, itemIndex);
					else if (operation === 'content') results = await content.execute.call(this, itemIndex);
					else if (operation === 'screenshot') results = await screenshot.execute.call(this, itemIndex);
				} else if (resource === 'googleSerp') {
					results = await googleSerp.execute.call(this, itemIndex);
				} else if (resource === 'profile') {
					results = await profile.execute.call(this, itemIndex);
				} else if (resource === 'proxy') {
					results = await proxy.execute.call(this, itemIndex);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource/operation: ${resource}/${operation}`, { itemIndex });
				}

				// Apply execution metadata and add to return data
				const executionData = this.helpers.constructExecutionMetaData(results, { itemData: { item: itemIndex } });
				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					const errorData: INodeExecutionData = {
						json: {
							error: (error as Error).message,
							resource,
							operation,
							timestamp: new Date().toISOString()
						},
						pairedItem: { item: itemIndex }
					};
					returnData.push(errorData);
				} else {
					const e: any = error;
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
