/* eslint-disable n8n-nodes-base/node-param-option-description-identical-to-name */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id */
/* eslint-disable n8n-nodes-base/node-param-description-boolean-without-whether */
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */

import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { runHooks } from './hooks.js';

import * as html from './html.js';
import * as content from './content.js';
import * as screenshot from './screenshot.js';
import * as pdf from './pdf.js';
import * as render from './render.js';
import * as batch from './batch.js';

// Enhanced operation categories with visual icons and smart grouping
const contentExtractionOperations: INodePropertyOptions[] = [
  {
    ...html.optionGet,
    name: '📄 Extract HTML (GET)',
    description: 'Extract raw HTML content from web pages using GET method - ideal for simple page scraping',
    action: 'Extract HTML content via GET'
  },
  {
    ...html.optionPost,
    name: '📄 Extract HTML (POST)',
    description: 'Extract raw HTML content with advanced options using POST - supports complex configurations',
    action: 'Extract HTML content via POST'
  },
  {
    ...content.optionGet,
    name: '📝 Extract Content (GET)',
    description: 'Extract clean, readable text content from web pages using GET method',
    action: 'Extract clean content via GET'
  },
  {
    ...content.optionPost,
    name: '📝 Extract Content (POST)',
    description: 'Extract clean, readable text with advanced filtering using POST method',
    action: 'Extract clean content via POST'
  }
];

const visualCaptureOperations: INodePropertyOptions[] = [
  {
    ...screenshot.option,
    name: '📸 Take Screenshot',
    description: 'Capture high-quality screenshots of web pages with customizable viewport and format options',
    action: 'Capture page screenshot'
  },
  {
    ...pdf.option,
    name: '📋 Generate PDF',
    description: 'Generate professional PDF documents from web pages with custom formatting options',
    action: 'Generate PDF document'
  }
];

const advancedProcessingOperations: INodePropertyOptions[] = [
  {
    ...render.option,
    name: '🎭 Advanced Render',
    description: 'Render pages with custom scripts, interactions, and advanced browser behaviors',
    action: 'Render with advanced options'
  },
  {
    ...batch.option,
    name: '🔄 Batch Processing',
    description: 'Process multiple URLs efficiently with controlled concurrency and error handling',
    action: 'Process multiple URLs'
  }
];

const operations: INodePropertyOptions[] = [
  ...contentExtractionOperations,
  ...visualCaptureOperations,
  ...advancedProcessingOperations
];

const operationSelect: INodeProperties = {
  displayName: 'Operation Name or ID',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  options: operations,
  default: 'htmlGet', // Smart default: most commonly used operation
  description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
};

// Enhanced URL validation properties with smart suggestions
const enhancedUrlProperties: INodeProperties[] = [
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://example.com',
    description: 'The URL of the web page to process',
    validateType: 'url',
    typeOptions: {
      rows: 1,
    },
    displayOptions: {
      show: {
        operation: [
          'htmlGet',
          'htmlPost',
          'contentGet',
          'contentPost',
          'screenshot',
          'pdf',
          'render'
        ],
      },
    },
  },
  {
    displayName: 'Advanced Options',
    name: 'advancedOptions',
    type: 'collection',
    placeholder: 'Add advanced option',
    default: {},
    description: 'Additional options for enhanced control and customization',
    options: [
      {
        displayName: 'Custom Headers',
        name: 'headers',
        type: 'fixedCollection',
        placeholder: 'Add header',
        default: { values: [] },
        description: 'Additional HTTP headers to send with the request',
        options: [
          {
            displayName: 'Header',
            name: 'values',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                placeholder: 'Authorization',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                placeholder: 'Bearer token...',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Extra Wait Time (MS)',
        name: 'extraWaitTime',
        type: 'number',
        default: 5000,
        description: 'Additional time to wait for dynamic content',
        typeOptions: {
          minValue: 0,
          maxValue: 60000,
        },
      },
      {
        displayName: 'Return Partial on Timeout',
        name: 'returnPartialOnTimeout',
        type: 'boolean',
        default: true,
        description: 'Whether to return partial content if timeout occurs',
      },
      {
        displayName: 'Scroll to Bottom',
        name: 'scrollToBottom',
        type: 'boolean',
        default: true,
        description: 'Whether to scroll through the page to trigger lazy loading',
      },
      {
        displayName: 'Timeout (MS)',
        name: 'timeout',
        type: 'number',
        default: 60000,
        description: 'Maximum time to wait for page load in milliseconds',
        typeOptions: {
          minValue: 5000,
          maxValue: 300000,
        },
      },
      {
        displayName: 'User Agent',
        name: 'userAgent',
        type: 'string',
        default: '',
        placeholder: 'Custom user agent (leave empty for automatic rotation)',
        description: 'Custom user agent string or leave empty for realistic rotation',
      },
      {
        displayName: 'Viewport',
        name: 'viewport',
        type: 'collection',
        placeholder: 'Set viewport dimensions',
        default: {},
        description: 'Browser viewport settings',
        options: [
          {
            displayName: 'Width',
            name: 'width',
            type: 'number',
            default: 1920,
            description: 'Viewport width in pixels',
            typeOptions: {
              minValue: 320,
              maxValue: 3840,
            },
          },
          {
            displayName: 'Height',
            name: 'height',
            type: 'number',
            default: 1080,
            description: 'Viewport height in pixels',
            typeOptions: {
              minValue: 240,
              maxValue: 2160,
            },
          },
        ],
      },
      {
        displayName: 'Wait for Network Idle',
        name: 'waitForNetworkIdle',
        type: 'boolean',
        default: true,
        description: 'Whether to wait for network activity to settle',
      },
      {
        displayName: 'Wait Until',
        name: 'waitUntil',
        type: 'options',
        options: [
          { name: 'Network Idle', value: 'networkidle', description: 'Wait until network is idle (recommended)' },
          { name: 'DOM Content Loaded', value: 'domcontentloaded', description: 'Wait until DOM is loaded' },
          { name: 'Load Event', value: 'load', description: 'Wait until load event is fired' },
        ],
        default: 'networkidle',
        description: 'When to consider navigation completed',
      },
    ],
    displayOptions: {
      show: {
        operation: [
          'htmlPost',
          'contentPost',
          'render'
        ],
      },
    },
  },
];

export const rawProperties: INodeProperties[] = [
  operationSelect,
  ...enhancedUrlProperties,
  ...html.properties,
  ...content.properties,
  ...screenshot.properties,
  ...pdf.properties,
  ...render.properties,
  ...batch.properties,
];

export const { properties, methods } = runHooks(rawProperties);
