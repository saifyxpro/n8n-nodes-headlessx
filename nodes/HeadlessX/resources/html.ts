import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';
import { PREVIEW_OPTION, TIMEOUT_OPTION, WAIT_UNTIL_OPTION, EXTRA_WAIT_TIME_OPTION, HEADERS_OPTION, USER_AGENT_OPTION } from './shared/commonOptions';

export const option: INodePropertyOptions = {
  name: 'Extract HTML',
  value: 'html',
  description: 'Extract raw HTML from a webpage (fast, no JS rendering)',
  action: 'Extract HTML',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'HTML Options',
    name: 'htmlOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: { operation: ['html'] },
    },
    options: [
      HEADERS_OPTION,
      PREVIEW_OPTION,
      EXTRA_WAIT_TIME_OPTION,
      TIMEOUT_OPTION,
      USER_AGENT_OPTION,
      WAIT_UNTIL_OPTION,
    ],
  },
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const opt = this.getNodeParameter('htmlOptions', i, {}) as IDataObject;
  const enablePreview = opt.enablePreview as boolean || false;

  // Construct standard options object expected by backend
  const options: IDataObject = {};
  if (opt.waitForSelector) options.waitForSelector = opt.waitForSelector;
  if (opt.timeout) options.timeout = opt.timeout;
  if (opt.headers) options.headers = opt.headers;
  // userAgent is not in backend V2 scrape options, so we omit unless profileId handles it

  const body: IDataObject = {
    url,
    options
  };

  const response = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/website/html',
    body,
    json: true,
  });

  const htmlContent = typeof response === 'object' && response.data ? response.data : response;

  const result: INodeExecutionData = {
    json: {
      url,
      contentLength: typeof htmlContent === 'string' ? htmlContent.length : 0,
      timestamp: new Date().toISOString(),
      success: true,
      previewMode: enablePreview,
    },
  };

  if (enablePreview && typeof htmlContent === 'string') {
    try {
      const fileName = `webpage_${Date.now()}.html`;
      const buffer = Buffer.from(htmlContent, 'utf8');

      const binaryData = await this.helpers.prepareBinaryData(
        buffer,
        fileName,
        'text/html'
      );

      result.binary = { data: binaryData };
      result.json.preview = {
        type: 'html',
        fileName: fileName,
        summary: htmlContent.substring(0, 500) + (htmlContent.length > 500 ? '...' : ''),
        fullLength: htmlContent.length,
      };
    } catch (error) {
      result.json.html = htmlContent;
      result.json.previewError = `Failed to create binary preview: ${(error as Error).message}`;
    }
  } else {
    result.json.html = htmlContent;
  }

  return [result];
}
