import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

export const optionGet: INodePropertyOptions = {
  name: 'Extract HTML (GET)',
  value: 'htmlGet',
  description: 'Extract raw HTML from a webpage using GET request',
  action: 'Extract HTML via GET',
};

export const optionPost: INodePropertyOptions = {
  name: 'Extract HTML (POST)',
  value: 'htmlPost',
  description: 'Extract raw HTML from a webpage using POST request with advanced options',
  action: 'Extract HTML via POST',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: { operation: ['htmlGet'] },
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
    displayOptions: { show: { operation: ['htmlPost'] } },
  },
];

export async function htmlGet(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const opt = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
  const html = await headlessxApiRequest.call(this, {
    method: 'GET',
    url: '/api/html',
    qs: { url, ...opt },
    json: false,
  });
  return [{
    json: {
      url,
      html,
      contentLength: typeof html === 'string' ? html.length : 0,
      timestamp: new Date().toISOString(),
      success: true,
    },
  } satisfies INodeExecutionData];
}

export async function htmlPost(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  let adv: IDataObject;
  try {
    adv = JSON.parse((this.getNodeParameter('advancedOptions', i, '{}') as string) || '{}');
  } catch {
    throw new NodeOperationError(this.getNode(), 'Advanced Options must be valid JSON', { itemIndex: i });
  }
  const html = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/html',
    body: { url, ...adv },
    json: false,
  });
  return [{
    json: {
      url,
      html,
      contentLength: typeof html === 'string' ? html.length : 0,
      options: adv,
      timestamp: new Date().toISOString(),
      success: true,
    },
  } satisfies INodeExecutionData];
}

// Main execute function for unified interface
export async function execute(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', itemIndex) as string;

  if (operation === 'htmlGet') {
    return await htmlGet.call(this, itemIndex);
  } else if (operation === 'htmlPost') {
    return await htmlPost.call(this, itemIndex);
  } else {
    throw new NodeOperationError(this.getNode(), `Unknown HTML operation: ${operation}`, { itemIndex });
  }
}
