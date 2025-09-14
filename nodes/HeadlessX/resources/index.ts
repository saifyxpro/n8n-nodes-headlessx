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
