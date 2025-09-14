import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';
import { EXTRA_WAIT_TIME_OPTION, TIMEOUT_OPTION, WAIT_UNTIL_OPTION } from './shared/commonOptions';

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
      EXTRA_WAIT_TIME_OPTION,
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'A4', value: 'A4' },
          { name: 'Letter', value: 'Letter' },
          { name: 'Legal', value: 'Legal' },
          { name: 'Tabloid', value: 'Tabloid' },
        ],
        default: 'A4',
        description: 'Paper format for the PDF',
      },
      {
        displayName: 'Landscape',
        name: 'landscape',
        type: 'boolean',
        default: false,
        description: 'Whether to generate PDF in landscape orientation',
      },
      {
        displayName: 'Margin Bottom',
        name: 'marginBottom',
        type: 'string',
        default: '0.4in',
        description: 'Bottom margin (e.g., "0.4in", "10mm", "20px")',
      },
      {
        displayName: 'Margin Left',
        name: 'marginLeft',
        type: 'string',
        default: '0.4in',
        description: 'Left margin (e.g., "0.4in", "10mm", "20px")',
      },
      {
        displayName: 'Margin Right',
        name: 'marginRight',
        type: 'string',
        default: '0.4in',
        description: 'Right margin (e.g., "0.4in", "10mm", "20px")',
      },
      {
        displayName: 'Margin Top',
        name: 'marginTop',
        type: 'string',
        default: '0.4in',
        description: 'Top margin (e.g., "0.4in", "10mm", "20px")',
      },
      {
        displayName: 'Print Background',
        name: 'printBackground',
        type: 'boolean',
        default: true,
        description: 'Whether to print background graphics and colors',
      },
      TIMEOUT_OPTION,
      WAIT_UNTIL_OPTION,
    ],
  },
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const pdfOptions = this.getNodeParameter('pdfOptions', i, {}) as IDataObject;

  // Set default values for perfect rendering
  const enhancedOptions = {
    ...pdfOptions,
    // Ensure perfect rendering defaults
    extraWaitTime: pdfOptions.extraWaitTime || 5000,
    printBackground: pdfOptions.printBackground !== false,
    waitUntil: pdfOptions.waitUntil || 'networkidle0',
    timeout: Number(pdfOptions.timeout) || 60000,
  };

  try {
    const response = await headlessxApiRequest.call(this, {
      method: 'GET',
      url: '/api/pdf',
      qs: { url, ...enhancedOptions },
      encoding: null,
      json: false,
      timeout: enhancedOptions.timeout,
      returnFullResponse: true,
    });

    // Handle response properly - could be Buffer or have data property
    let buffer: Buffer;
    if (Buffer.isBuffer(response)) {
      buffer = response;
    } else if (response && response.body && Buffer.isBuffer(response.body)) {
      buffer = response.body;
    } else if (response && response.data && Buffer.isBuffer(response.data)) {
      buffer = response.data;
    } else {
      throw new Error('Invalid PDF response format from HeadlessX API');
    }

    const fileName = `document_${Date.now()}.pdf`;
    const binary = await this.helpers.prepareBinaryData(buffer, fileName, 'application/pdf');

    return [{
      json: {
        success: true,
        filename: fileName,
        size: buffer.length,
        format: (pdfOptions.format as string) || 'A4',
        url,
        timestamp: new Date().toISOString(),
        options: enhancedOptions,
      },
      binary: { data: binary },
    } satisfies INodeExecutionData];
  } catch (error) {
    throw new NodeOperationError(this.getNode(), `PDF generation failed: ${(error as Error).message}`, { itemIndex: i });
  }
}
