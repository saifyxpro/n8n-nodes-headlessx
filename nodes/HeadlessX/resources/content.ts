import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';
import { PREVIEW_OPTION, TIMEOUT_OPTION, WAIT_UNTIL_OPTION, EXTRA_WAIT_TIME_OPTION, HEADERS_OPTION, USER_AGENT_OPTION } from './shared/commonOptions';

export const option: INodePropertyOptions = {
  name: 'Extract Content',
  value: 'content',
  description: 'Extract clean Markdown content from a webpage',
  action: 'Extract content',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'Content Options',
    name: 'contentOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: { operation: ['content'] },
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
  const opt = this.getNodeParameter('contentOptions', i, {}) as IDataObject;
  const enablePreview = opt.enablePreview as boolean || false;

  const options: IDataObject = {};
  if (opt.waitForSelector) options.waitForSelector = opt.waitForSelector;
  if (opt.includeTags) options.includeTags = opt.includeTags;
  if (opt.excludeTags) options.excludeTags = opt.excludeTags;

  const body: IDataObject = { url, options };

  const response = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/website/content',
    body,
    json: true,
  });

  // response is expected to be { url, markdown, title, metadata }
  const markdown = response.markdown || '';

  const result: INodeExecutionData = {
    json: {
      ...response,
      timestamp: new Date().toISOString(),
      previewMode: enablePreview,
    },
  };

  if (enablePreview && markdown) {
    try {
      const fileName = `content_${Date.now()}.md`;
      const buffer = Buffer.from(markdown, 'utf8');
      const binaryData = await this.helpers.prepareBinaryData(buffer, fileName, 'text/markdown');

      result.binary = { data: binaryData };
    } catch (error) {
      // ignore
    }
  }

  return [result];
}
