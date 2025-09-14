import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

export const optionGet: INodePropertyOptions = {
  name: 'Extract Text (GET)',
  value: 'contentGet',
  description: 'Extract clean text content from a webpage using GET request',
  action: 'Extract text via GET',
};

export const optionPost: INodePropertyOptions = {
  name: 'Extract Text (POST)',
  value: 'contentPost',
  description: 'Extract clean text content from a webpage using POST request',
  action: 'Extract text via POST',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: { operation: ['contentGet'] },
    },
    options: [
      {
        displayName: 'Timeout (MS)',
        name: 'timeout',
        type: 'number',
        default: 0,
        description: 'Override request timeout. 0 uses the server default.',
      },
      {
        displayName: 'Wait Until',
        name: 'waitUntil',
        type: 'options',
        options: [
          { name: 'Load', value: 'load' },
          { name: 'DOMContentLoaded', value: 'domcontentloaded' },
          { name: 'Network Idle', value: 'networkidle0' },
        ],
        default: 'load',
        description: 'When to consider navigation successful',
      },
    ],
  },
  {
    displayName: 'Advanced Options (JSON)',
    name: 'advancedOptions',
    type: 'string',
    typeOptions: { rows: 4 },
    default: '{}',
    description: 'JSON object with advanced options to pass to the API',
    displayOptions: { show: { operation: ['contentPost'] } },
  },
];

export async function contentGet(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const opt = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
  const content = await headlessxApiRequest.call(this, {
    method: 'GET',
    url: '/api/content',
    qs: { url, ...opt },
    json: false,
  });
  return [{
    json: {
      url,
      content,
      contentLength: typeof content === 'string' ? content.length : 0,
      timestamp: new Date().toISOString(),
      success: true,
    },
  } satisfies INodeExecutionData];
}

export async function contentPost(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  let adv: IDataObject;
  try {
    adv = JSON.parse((this.getNodeParameter('advancedOptions', i, '{}') as string) || '{}');
  } catch {
    throw new NodeOperationError(this.getNode(), 'Advanced Options must be valid JSON', { itemIndex: i });
  }
  const content = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/content',
    body: { url, ...adv },
    json: false,
  });
  return [{
    json: {
      url,
      content,
      contentLength: typeof content === 'string' ? content.length : 0,
      options: adv,
      timestamp: new Date().toISOString(),
      success: true,
    },
  } satisfies INodeExecutionData];
}

// Main execute function for unified interface
export async function execute(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', itemIndex) as string;

  if (operation === 'contentGet') {
    return await contentGet.call(this, itemIndex);
  } else if (operation === 'contentPost') {
    return await contentPost.call(this, itemIndex);
  } else {
    throw new NodeOperationError(this.getNode(), `Unknown content operation: ${operation}`, { itemIndex });
  }
}
