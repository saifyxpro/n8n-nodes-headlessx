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
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
      {
        displayName: 'Capture Full Page',
        name: 'captureFullPage',
        type: 'boolean',
        default: true,
        description: 'Whether to capture the full page or just the visible viewport',
      },
      {
        displayName: 'Custom Height',
        name: 'customHeight',
        type: 'number',
        default: 1080,
        description: 'Custom viewport height in pixels',
        displayOptions: {
          show: {
            deviceEmulation: ['custom'],
          },
        },
        typeOptions: {
          minValue: 100,
          maxValue: 4000,
        },
      },
      {
        displayName: 'Custom Width',
        name: 'customWidth',
        type: 'number',
        default: 1920,
        description: 'Custom viewport width in pixels',
        displayOptions: {
          show: {
            deviceEmulation: ['custom'],
          },
        },
        typeOptions: {
          minValue: 100,
          maxValue: 4000,
        },
      },
      {
        displayName: 'Dark Mode',
        name: 'darkMode',
        type: 'boolean',
        default: false,
        description: 'Whether to enable dark mode for the screenshot',
      },
      {
        displayName: 'Device Emulation',
        name: 'deviceEmulation',
        type: 'options',
        options: [
          { name: 'Custom', value: 'custom', description: 'Use custom viewport dimensions' },
          { name: 'Desktop (Default)', value: 'desktop', description: 'Standard desktop view (1920x1080)' },
          { name: 'Mobile Phone', value: 'mobile', description: 'Mobile phone view (375x667)' },
          { name: 'Mobile Phone Landscape', value: 'mobile-landscape', description: 'Mobile landscape view (667x375)' },
          { name: 'Tablet', value: 'tablet', description: 'Tablet view (768x1024)' },
          { name: 'Tablet Landscape', value: 'tablet-landscape', description: 'Tablet landscape view (1024x768)' },
        ],
        default: 'desktop',
        description: 'Choose device type for screenshot capture',
      },
      {
        displayName: 'Disable Animations',
        name: 'disableAnimations',
        type: 'boolean',
        default: true,
        description: 'Whether to disable CSS animations and transitions',
      },
      {
        displayName: 'Extra Wait Time (MS)',
        name: 'extraWaitTime',
        type: 'number',
        default: 5000,
        description: 'Additional time to wait before taking screenshot to ensure all content loads',
        typeOptions: {
          minValue: 0,
          maxValue: 30000,
        },
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'JPEG', value: 'jpeg', description: 'JPEG format - smaller file size, lossy compression' },
          { name: 'PNG', value: 'png', description: 'PNG format - larger file size, lossless compression' },
          { name: 'WebP', value: 'webp', description: 'WebP format - modern format, best compression' },
        ],
        default: 'png',
        description: 'Image format for the screenshot',
      },
      {
        displayName: 'Hide Elements',
        name: 'hideElements',
        type: 'string',
        default: '',
        placeholder: '.ads, #popup, .cookie-banner',
        description: 'CSS selectors of elements to hide before taking screenshot (comma-separated)',
      },
      {
        displayName: 'Quality',
        name: 'quality',
        type: 'number',
        default: 80,
        description: 'Image quality (1-100, only applies to JPEG and WebP)',
        displayOptions: {
          show: {
            format: ['jpeg', 'webp'],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
      },
      {
        displayName: 'Remove Elements',
        name: 'removeElements',
        type: 'string',
        default: '',
        placeholder: '.ads, #popup, .cookie-banner',
        description: 'CSS selectors of elements to remove before taking screenshot (comma-separated)',
      },
      TIMEOUT_OPTION,
      USER_AGENT_OPTION,
      {
        displayName: 'Wait for Selector',
        name: 'waitForSelector',
        type: 'string',
        default: '',
        placeholder: '.content-loaded, #main-content',
        description: 'CSS selector to wait for before taking screenshot',
      },
    ],
  },
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

  if (!url) {
    throw new NodeOperationError(this.getNode(), 'URL is required', { itemIndex: i });
  }

  // Set default values for perfect rendering
  const enhancedOptions = {
    ...additionalOptions,
    // Ensure perfect rendering defaults
    extraWaitTime: additionalOptions.extraWaitTime || 5000,
    captureFullPage: additionalOptions.captureFullPage !== false,
    disableAnimations: additionalOptions.disableAnimations !== false,
    timeout: Number(additionalOptions.timeout) || 60000,
    format: additionalOptions.format || 'png',
    quality: additionalOptions.quality || 80,
  };

  try {
    // Get binary data from HeadlessX API using GET for better compatibility
    const response = await headlessxApiRequest.call(this, {
      method: 'GET',
      url: '/api/screenshot',
      qs: { url, ...enhancedOptions },
      json: false,
      encoding: null, // Get raw binary data
      timeout: enhancedOptions.timeout,
      returnFullResponse: true,
    });

    // Handle the response which might be a Buffer or have data/body property
    let imageBuffer: Buffer;

    if (Buffer.isBuffer(response)) {
      imageBuffer = response;
    } else if (response && response.body && Buffer.isBuffer(response.body)) {
      imageBuffer = response.body;
    } else if (response && response.data && Buffer.isBuffer(response.data)) {
      imageBuffer = response.data;
    } else if (typeof response === 'string') {
      // If it's a base64 string, convert it to buffer
      imageBuffer = Buffer.from(response, 'base64');
    } else if (response && response.body && typeof response.body === 'string') {
      imageBuffer = Buffer.from(response.body, 'base64');
    } else if (response && response.data && typeof response.data === 'string') {
      imageBuffer = Buffer.from(response.data, 'base64');
    } else {
      throw new Error('Invalid response format from HeadlessX API');
    }

    // Determine file extension and MIME type based on format
    const format = enhancedOptions.format as string;
    const mimeType = format === 'jpeg' ? 'image/jpeg' :
                    format === 'webp' ? 'image/webp' : 'image/png';
    const fileExtension = format === 'jpeg' ? 'jpg' : format;
    const fileName = `screenshot_${Date.now()}.${fileExtension}`;

    // Prepare binary data for n8n
    const binaryData = await this.helpers.prepareBinaryData(
      imageBuffer,
      fileName,
      mimeType
    );

    return [{
      json: {
        success: true,
        url,
        format,
        timestamp: new Date().toISOString(),
        fileSize: imageBuffer.length,
        fileName,
        options: enhancedOptions,
      },
      binary: {
        data: binaryData,
      },
    } satisfies INodeExecutionData];
  } catch (error) {
    throw new NodeOperationError(this.getNode(), `Screenshot capture failed: ${(error as Error).message}`, { itemIndex: i });
  }
}
