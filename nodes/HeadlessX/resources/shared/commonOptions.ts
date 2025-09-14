import { INodeProperties } from 'n8n-workflow';

/**
 * Shared option configurations to reduce code duplication across resource files
 */

// Standard Headers Configuration (used by html, content, render)
export const HEADERS_OPTION: INodeProperties = {
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
};

// Standard User Agent Configuration (used by html, content, render, screenshot)
export const USER_AGENT_OPTION: INodeProperties = {
  displayName: 'User Agent',
  name: 'userAgent',
  type: 'string',
  default: '',
  placeholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  description: 'Custom user agent string (leave empty for automatic rotation)',
};

// Standard Timeout Configuration (used by all operations)
export const TIMEOUT_OPTION: INodeProperties = {
  displayName: 'Timeout (MS)',
  name: 'timeout',
  type: 'number',
  default: 60000,
  description: 'Maximum time to wait for page load in milliseconds',
  typeOptions: {
    minValue: 5000,
    maxValue: 300000,
  },
};

// Standard Extra Wait Time Configuration (used by html, content, pdf, render, screenshot)
export const EXTRA_WAIT_TIME_OPTION: INodeProperties = {
  displayName: 'Extra Wait Time (MS)',
  name: 'extraWaitTime',
  type: 'number',
  default: 5000,
  description: 'Additional time to wait for dynamic content to load completely',
  typeOptions: {
    minValue: 0,
    maxValue: 60000,
  },
};

// Standard Wait Until Configuration (used by all operations)
export const WAIT_UNTIL_OPTION: INodeProperties = {
  displayName: 'Wait Until',
  name: 'waitUntil',
  type: 'options',
  options: [
    { name: 'Network Idle', value: 'networkidle0', description: 'Wait until network is completely idle (recommended)' },
    { name: 'DOM Content Loaded', value: 'domcontentloaded', description: 'Wait until DOM is loaded' },
    { name: 'Load Event', value: 'load', description: 'Wait until load event is fired' },
  ],
  default: 'networkidle0',
  description: 'When to consider navigation completed',
};

// Standard Preview Configuration (used by html, content)
export const PREVIEW_OPTION: INodeProperties = {
  displayName: 'Enable Preview',
  name: 'enablePreview',
  type: 'boolean',
  default: false,
  description: 'Whether to show content preview AND provide downloadable file in binary section',
};
