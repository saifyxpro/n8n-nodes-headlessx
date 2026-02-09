import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';
import { TIMEOUT_OPTION, USER_AGENT_OPTION } from './shared/commonOptions';

export const option: INodePropertyOptions = {
  name: 'Take Screenshot',
  value: 'screenshot',
  description: 'Capture a screenshot of a webpage',
  action: 'Take screenshot',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'Screenshot Options',
    name: 'screenshotOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { operation: ['screenshot'] } },
    options: [
      {
        displayName: 'Full Page',
        name: 'fullPage',
        type: 'boolean',
        default: true,
        description: 'Whether to capture the full page or just the viewport',
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'PNG', value: 'png' },
          { name: 'JPEG', value: 'jpeg' },
          { name: 'WebP', value: 'webp' },
        ],
        default: 'png',
        description: 'Image format for the screenshot',
      },
      {
        displayName: 'Quality',
        name: 'quality',
        type: 'number',
        default: 80,
        description: 'Image quality (1-100, only for JPEG/WebP)',
        displayOptions: { show: { format: ['jpeg', 'webp'] } },
        typeOptions: { minValue: 1, maxValue: 100 },
      },
      {
        displayName: 'Wait for Selector',
        name: 'waitForSelector',
        type: 'string',
        default: '',
        placeholder: '.content-loaded',
        description: 'CSS selector to wait for before taking screenshot',
      },
      TIMEOUT_OPTION,
      USER_AGENT_OPTION,
    ],
  },
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  try {
    const url = this.getNodeParameter('url', i) as string;
    const opt = this.getNodeParameter('screenshotOptions', i, {}) as IDataObject;

    const options: IDataObject = {};
    if (opt.waitForSelector) options.waitForSelector = opt.waitForSelector;
    if (opt.fullPage !== undefined) options.fullPage = opt.fullPage;
    if (opt.timeout) options.waitForTimeout = opt.timeout;
    if (opt.stealth !== undefined) options.stealth = opt.stealth;

    const body: IDataObject = { url, options };
    if (opt.profileId) body.profileId = opt.profileId;

    const response = await headlessxApiRequest.call(this, {
      method: 'POST',
      url: '/api/website/screenshot',
      body,
      encoding: 'arraybuffer',
      json: false,
    });

    const fileName = `screenshot_${Date.now()}.jpg`;
    const binaryData = await this.helpers.prepareBinaryData(
      response as Buffer,
      fileName,
      'image/jpeg'
    );

    return [
      {
        json: {
          url,
          success: true,
          timestamp: new Date().toISOString(),
          fileName,
        },
        binary: {
          data: binaryData,
        },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(this.getNode(), `Screenshot failed: ${(error as Error).message}`, { itemIndex: i });
  }
}
