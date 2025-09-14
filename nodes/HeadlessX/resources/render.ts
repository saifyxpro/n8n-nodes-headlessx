import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

export const option: INodePropertyOptions = {
  name: 'Full Page Render',
  value: 'render',
  description: 'Render page with detailed options and metadata',
  action: 'Render full page',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'Advanced Options (JSON)',
    name: 'advancedOptions',
    type: 'string',
    typeOptions: { rows: 4 },
    default: '{}',
    description: 'JSON object with advanced options to pass to the API',
    displayOptions: { show: { operation: ['render'] } },
  },
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  let adv: IDataObject;
  try {
    adv = JSON.parse((this.getNodeParameter('advancedOptions', i, '{}') as string) || '{}');
  } catch {
    throw new NodeOperationError(this.getNode(), 'Advanced Options must be valid JSON', { itemIndex: i });
  }
  const response = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/render',
    body: { url, ...adv },
    json: true,
  });
  return [{
    json: response as IDataObject,
  } satisfies INodeExecutionData];
}
