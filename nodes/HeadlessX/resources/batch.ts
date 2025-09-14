import { INodeProperties, INodePropertyOptions, IExecuteFunctions, INodeExecutionData, IDataObject, NodeOperationError } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

export const optionGet: INodePropertyOptions = {
  name: 'Batch Processing',
  value: 'batch',
  description: 'Process multiple requests in batch mode',
  action: 'Batch processing',
};

export const option = optionGet;

export const properties: INodeProperties[] = [
  {
    displayName: 'URLs (JSON Array)',
    name: 'batchUrls',
    type: 'string',
    typeOptions: {
      rows: 6,
      editorLanguage: 'json'
    },
    default: '[\n  "https://example.com",\n  "https://another-site.com"\n]',
    placeholder: '[\n  "https://example.com",\n  "https://another-site.com",\n  "https://third-site.com"\n]',
    description: 'JSON array of URLs to process in batch (max 10 URLs)',
    displayOptions: { show: { operation: ['batch'] } },
    required: true,
  },
  {
    displayName: 'Batch Type',
    name: 'batchType',
    type: 'options',
    options: [
      {
        name: '📸 Screenshot Batch',
        value: 'screenshot',
        description: 'Capture screenshots of multiple pages simultaneously',
      },
      {
        name: '📝 Content Extraction Batch',
        value: 'content',
        description: 'Extract clean text content from multiple pages',
      },
      {
        name: '📄 HTML Extraction Batch',
        value: 'html',
        description: 'Get raw HTML source from multiple pages',
      },
      {
        name: '📋 PDF Generation Batch',
        value: 'pdf',
        description: 'Generate PDF documents from multiple pages',
      },
    ],
    default: 'screenshot',
    description: 'Choose the type of batch processing to perform',
    displayOptions: {
      show: {
        operation: ['batch'],
      },
    },
  },
  {
    displayName: 'Advanced Batch Options',
    name: 'batchOptions',
    type: 'collection',
    placeholder: 'Add advanced option',
    default: {},
    description: 'Configure advanced batch processing settings',
    displayOptions: { show: { operation: ['batch'] } },
    options: [
      {
        displayName: 'Concurrency Limit',
        name: 'concurrency',
        type: 'number',
        default: 3,
        description: 'Number of URLs to process simultaneously (1-5 recommended)',
        typeOptions: {
          minValue: 1,
          maxValue: 5,
        },
      },
      {
        displayName: 'Error Handling',
        name: 'errorHandling',
        type: 'options',
        options: [
          { name: 'Continue on Error', value: 'continue', description: 'Continue processing other URLs if one fails' },
          { name: 'Stop on First Error', value: 'stop', description: 'Stop entire batch if any URL fails' },
          { name: 'Retry Failed URLs', value: 'retry', description: 'Automatically retry failed URLs once' },
        ],
        default: 'continue',
        description: 'How to handle errors during batch processing',
      },
      {
        displayName: 'Timeout (MS)',
        name: 'timeout',
        type: 'number',
        default: 60000,
        description: 'Maximum time to wait for each URL in milliseconds',
        typeOptions: {
          minValue: 5000,
          maxValue: 300000,
        },
      },
      {
        displayName: 'Wait Between Requests (MS)',
        name: 'waitTime',
        type: 'number',
        default: 1000,
        description: 'Time to wait between processing each URL in milliseconds',
        typeOptions: {
          minValue: 0,
          maxValue: 10000,
        },
      },
    ],
  },
  {
    displayName: 'Simplify',
    name: 'simple',
    type: 'boolean',
    default: true,
    description: 'Whether to return a simplified version of the response instead of the raw data',
    displayOptions: {
      show: {
        operation: ['batch'],
      },
    },
  },
];

export async function execute(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  let batchUrls: string[];
  try {
    const batchUrlsInput = this.getNodeParameter('batchUrls', itemIndex) as string;
    batchUrls = JSON.parse(batchUrlsInput);
    if (!Array.isArray(batchUrls)) {
      throw new NodeOperationError(this.getNode(), 'URLs must be provided as a JSON array', { itemIndex });
    }
    for (const url of batchUrls) {
      if (typeof url !== 'string' || !url.trim()) {
        throw new NodeOperationError(this.getNode(), 'Each URL must be a non-empty string', { itemIndex });
      }
    }
  } catch (error) {
    if (error instanceof NodeOperationError) throw error;
    throw new NodeOperationError(this.getNode(), 'Invalid JSON format for URLs. Please provide a valid JSON array of URLs like: ["https://example.com", "https://another.com"]', { itemIndex });
  }

  const batchOptions = this.getNodeParameter('batchOptions', itemIndex, {}) as IDataObject;

  const responseData = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/batch',
    body: { urls: batchUrls, ...batchOptions },
  });

  return [{ json: responseData }];
}
