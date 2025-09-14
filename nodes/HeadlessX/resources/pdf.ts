import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

export const option: INodePropertyOptions = {
  name: 'Generate PDF',
  value: 'pdf',
  description: 'Generate PDF from a webpage',
  action: 'Generate PDF',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'PDF Options',
    name: 'pdfOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { operation: ['pdf'] } },
    options: [
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'A4', value: 'A4' },
          { name: 'Letter', value: 'Letter' },
        ],
        default: 'A4',
      },
      { displayName: 'Landscape', name: 'landscape', type: 'boolean', default: false },
      { displayName: 'Print Background', name: 'printBackground', type: 'boolean', default: true },
    ],
  },
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: { operation: ['pdf'] },
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
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const general = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
  const specific = this.getNodeParameter('pdfOptions', i, {}) as IDataObject;
  const timeout = Number(general.timeout) || 90000;
  const buffer: any = await headlessxApiRequest.call(this, {
    method: 'GET',
    url: '/api/pdf',
    qs: { url, ...general, ...specific },
    encoding: null,
    timeout,
    json: false,
  });
  const fileName = `document_${Date.now()}.pdf`;
  const binary = await this.helpers.prepareBinaryData(buffer, fileName, 'application/pdf');
  return [{
    json: { success: true, filename: fileName, size: buffer.length, pages: (specific.format as string) || 'A4' },
    binary: { data: binary },
  } satisfies INodeExecutionData];
}
