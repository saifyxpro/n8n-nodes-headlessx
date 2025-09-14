import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

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
        name: 'extraWait',
        type: 'number',
        default: 2000,
        description: 'Additional time to wait before taking screenshot',
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
      {
        displayName: 'Scroll Behavior',
        name: 'scrollBehavior',
        type: 'options',
        options: [
          { name: 'Auto', value: 'auto', description: 'Automatic scrolling behavior' },
          { name: 'Instant', value: 'instant', description: 'No scrolling animation' },
          { name: 'Smooth', value: 'smooth', description: 'Smooth scrolling animation' },
        ],
        default: 'auto',
        description: 'How to handle page scrolling during screenshot',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Request timeout in milliseconds',
        typeOptions: {
          minValue: 1000,
          maxValue: 120000,
        },
      },
      {
        displayName: 'User Agent',
        name: 'userAgent',
        type: 'string',
        default: '',
        placeholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        description: 'Custom user agent string (leave empty for default)',
      },
      {
        displayName: 'Wait for Network Idle',
        name: 'waitForNetworkIdle',
        type: 'boolean',
        default: true,
        description: 'Whether to wait for network activity to finish before taking screenshot',
      },
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

  try {
    const responseData = await headlessxApiRequest.call(this, {
      method: 'POST',
      url: '/api/screenshot',
      body: { url, ...additionalOptions },
      json: true,
    });

    return [{
      json: responseData,
      binary: responseData.image ? {
        data: {
          data: responseData.image,
          mimeType: responseData.mimeType || 'image/png',
          fileName: responseData.filename || 'screenshot.png',
        },
      } : undefined,
    } satisfies INodeExecutionData];
  } catch (error) {
    throw new NodeOperationError(this.getNode(), `Screenshot capture failed: ${error.message}`, { itemIndex: i });
  }
}
