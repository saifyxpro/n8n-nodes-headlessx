import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { Buffer } from 'buffer';
import { headlessxApiRequest } from '../helpers/requests';
import { PREVIEW_OPTION, TIMEOUT_OPTION, WAIT_UNTIL_OPTION, EXTRA_WAIT_TIME_OPTION, HEADERS_OPTION, USER_AGENT_OPTION } from './shared/commonOptions';

export const optionGet: INodePropertyOptions = {
  name: 'Extract HTML (GET)',
  value: 'htmlGet',
  description: 'Extract raw HTML from a webpage using GET request',
  action: 'Extract HTML via GET',
};

export const optionPost: INodePropertyOptions = {
  name: 'Extract HTML (POST)',
  value: 'htmlPost',
  description: 'Extract raw HTML from a webpage using POST request with advanced options',
  action: 'Extract HTML via POST',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'HTML GET Options',
    name: 'htmlGetOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: { operation: ['htmlGet'] },
    },
    options: [
      PREVIEW_OPTION,
      TIMEOUT_OPTION,
      { ...WAIT_UNTIL_OPTION, default: 'load' },
    ],
  },
  {
    displayName: 'HTML POST Options',
    name: 'htmlPostOptions',
    type: 'collection',
    placeholder: 'Add advanced option',
    default: {},
    displayOptions: {
      show: { operation: ['htmlPost'] },
    },
    description: 'Advanced options for POST requests with enhanced control',
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

export async function htmlGet(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const opt = this.getNodeParameter('htmlGetOptions', i, {}) as IDataObject;
  const enablePreview = opt.enablePreview as boolean || false;

  // Remove enablePreview from options sent to API
  const { enablePreview: _, ...apiOptions } = opt;

  const html = await headlessxApiRequest.call(this, {
    method: 'GET',
    url: '/api/html',
    qs: { url, ...apiOptions },
    json: true, // Keep as JSON to get proper string response
  });

  const htmlContent = typeof html === 'object' && html.data ? html.data : html;

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
      // Always provide binary data for download/preview like PDF/Screenshot
      const fileName = `webpage_${Date.now()}.html`;
      const buffer = Buffer.from(htmlContent, 'utf8');

      // Use proper n8n binary data preparation with explicit property name
      const binaryPropertyName = 'data';
      const binaryData = await this.helpers.prepareBinaryData(
        buffer,
        fileName,
        'text/html'
      );

      result.binary = {
        [binaryPropertyName]: binaryData
      };

      // Also include summary in JSON for quick reference
      result.json.preview = {
        type: 'html',
        fileName: fileName,
        summary: htmlContent.substring(0, 500) + (htmlContent.length > 500 ? '...' : ''),
        fullLength: htmlContent.length,
        note: 'Full HTML content available in binary data section for download/preview'
      };
    } catch (error) {
      // Fallback: if binary data creation fails, just return content in JSON
      result.json.html = htmlContent;
      result.json.previewError = `Failed to create binary preview: ${(error as Error).message}`;
    }
  } else {
    // Return as JSON (default behavior)
    result.json.html = htmlContent;
  }

  return [result];
}

export async function htmlPost(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const adv = this.getNodeParameter('htmlPostOptions', i, {}) as IDataObject;
  const enablePreview = adv.enablePreview as boolean || false;

  // Remove enablePreview from options sent to API
  const { enablePreview: _, ...apiOptions } = adv;

  const html = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/html',
    body: { url, ...apiOptions },
    json: true, // Keep as JSON to get proper string response
  });

  const htmlContent = typeof html === 'object' && html.data ? html.data : html;

  const result: INodeExecutionData = {
    json: {
      url,
      contentLength: typeof htmlContent === 'string' ? htmlContent.length : 0,
      options: adv,
      timestamp: new Date().toISOString(),
      success: true,
      previewMode: enablePreview,
    },
  };

  if (enablePreview && typeof htmlContent === 'string') {
    try {
      // Always provide binary data for download/preview like PDF/Screenshot
      const fileName = `webpage_${Date.now()}.html`;
      const buffer = Buffer.from(htmlContent, 'utf8');

      // Use proper n8n binary data preparation with explicit property name
      const binaryPropertyName = 'data';
      const binaryData = await this.helpers.prepareBinaryData(
        buffer,
        fileName,
        'text/html'
      );

      result.binary = {
        [binaryPropertyName]: binaryData
      };

      // Also include summary in JSON for quick reference
      result.json.preview = {
        type: 'html',
        fileName: fileName,
        summary: htmlContent.substring(0, 500) + (htmlContent.length > 500 ? '...' : ''),
        fullLength: htmlContent.length,
        note: 'Full HTML content available in binary data section for download/preview'
      };
    } catch (error) {
      // Fallback: if binary data creation fails, just return content in JSON
      result.json.html = htmlContent;
      result.json.previewError = `Failed to create binary preview: ${(error as Error).message}`;
    }
  } else {
    // Return as JSON (default behavior)
    result.json.html = htmlContent;
  }

  return [result];
}

// Main execute function for unified interface
export async function execute(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', itemIndex) as string;

  if (operation === 'htmlGet') {
    return await htmlGet.call(this, itemIndex);
  } else if (operation === 'htmlPost') {
    return await htmlPost.call(this, itemIndex);
  } else {
    throw new NodeOperationError(this.getNode(), `Unknown HTML operation: ${operation}`, { itemIndex });
  }
}
