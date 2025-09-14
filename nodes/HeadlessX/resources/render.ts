import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';
import { EXTRA_WAIT_TIME_OPTION, HEADERS_OPTION, TIMEOUT_OPTION, USER_AGENT_OPTION, WAIT_UNTIL_OPTION } from './shared/commonOptions';

export const option: INodePropertyOptions = {
  name: 'Full Page Render',
  value: 'render',
  description: 'Render page with detailed options and metadata',
  action: 'Render full page',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'Render Options',
    name: 'renderOptions',
    type: 'collection',
    placeholder: 'Add render option',
    default: {},
    displayOptions: {
      show: { operation: ['render'] },
    },
    description: 'Advanced rendering options with full browser control',
    options: [
      HEADERS_OPTION,
      {
        displayName: 'Execute Script',
        name: 'executeScript',
        type: 'string',
        default: '',
        placeholder: 'document.querySelector("button").click();',
        description: 'JavaScript code to execute on the page before rendering',
        typeOptions: {
          rows: 3,
        },
      },
      EXTRA_WAIT_TIME_OPTION,
      {
        displayName: 'Scroll to Bottom',
        name: 'scrollToBottom',
        type: 'boolean',
        default: true,
        description: 'Whether to scroll through the page to trigger lazy loading',
      },
      TIMEOUT_OPTION,
      USER_AGENT_OPTION,
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
      WAIT_UNTIL_OPTION,
    ],
  },
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const renderOptions = this.getNodeParameter('renderOptions', i, {}) as IDataObject;

  const response = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/render',
    body: { url, ...renderOptions },
    json: true,
  });
  return [{
    json: response as IDataObject,
  } satisfies INodeExecutionData];
}
