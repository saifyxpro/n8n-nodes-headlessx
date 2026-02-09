/* eslint-disable n8n-nodes-base/node-param-option-description-identical-to-name */
/* eslint-disable n8n-nodes-base/node-param-display-name-miscased-id */
/* eslint-disable n8n-nodes-base/node-param-description-boolean-without-whether */
/* eslint-disable n8n-nodes-base/node-param-options-type-unsorted-items */

import { INodeProperties } from 'n8n-workflow';
import { runHooks } from './hooks.js';

import * as html from './html.js';
import * as htmlJs from './htmlJs.js';
import * as content from './content.js';
import * as screenshot from './screenshot.js';
import * as googleSerp from './googleSerp.js';
import * as profile from './profile.js';
import * as proxy from './proxy.js';

// Resource Selection
const resourceSelect: INodeProperties = {
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'Website',
      value: 'website',
      description: 'Scrape and control websites',
    },
    {
      name: 'Google SERP',
      value: 'googleSerp',
      description: 'Search Google',
    },
    {
      name: 'Profile',
      value: 'profile',
      description: 'Manage browser profiles',
    },
    {
      name: 'Proxy',
      value: 'proxy',
      description: 'Manage proxies',
    },
  ],
  default: 'website',
};

// Website Operations
const websiteOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['website'],
    },
  },
  options: [
    {
      name: 'Extract HTML',
      value: 'html',
      description: 'Extract raw HTML (Fast)',
      action: 'Extract HTML',
    },
    {
      name: 'Extract HTML (JS Rendered)',
      value: 'htmlJs',
      description: 'Extract HTML with JS rendering',
      action: 'Extract HTML with JS',
    },
    {
      name: 'Extract Content (Markdown)',
      value: 'content',
      description: 'Extract clean Markdown content',
      action: 'Extract content',
    },
    {
      name: 'Take Screenshot',
      value: 'screenshot',
      description: 'Capture screenshot',
      action: 'Take screenshot',
    },
  ],
  default: 'html',
};

// URL property for website operations
const urlProperty: INodeProperties = {
  displayName: 'URL',
  name: 'url',
  type: 'string',
  required: true,
  default: '',
  placeholder: 'https://example.com',
  description: 'The URL of the web page to process',
  validateType: 'url',
  displayOptions: {
    show: {
      resource: ['website'],
    },
  },
};

export const rawProperties: INodeProperties[] = [
  resourceSelect,

  // Website Properties
  websiteOperations,
  urlProperty,
  ...html.properties,
  ...htmlJs.properties,
  ...content.properties,
  ...screenshot.properties,

  // Google SERP Properties
  ...googleSerp.allProperties,

  // Profile Properties
  ...profile.properties,

  // Proxy Properties
  ...proxy.properties,
];

export const { properties, methods } = runHooks(rawProperties);

