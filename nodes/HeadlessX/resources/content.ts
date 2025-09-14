import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { Buffer } from 'buffer';
import { headlessxApiRequest } from '../helpers/requests';
import { PREVIEW_OPTION, TIMEOUT_OPTION, WAIT_UNTIL_OPTION, EXTRA_WAIT_TIME_OPTION, HEADERS_OPTION, USER_AGENT_OPTION } from './shared/commonOptions';

export const optionGet: INodePropertyOptions = {
  name: 'Extract Text (GET)',
  value: 'contentGet',
  description: 'Extract clean text content from a webpage using GET request',
  action: 'Extract text via GET',
};

export const optionPost: INodePropertyOptions = {
  name: 'Extract Text (POST)',
  value: 'contentPost',
  description: 'Extract clean text content from a webpage using POST request',
  action: 'Extract text via POST',
};

export const properties: INodeProperties[] = [
  {
    displayName: 'Content GET Options',
    name: 'contentGetOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: { operation: ['contentGet'] },
    },
    options: [
      PREVIEW_OPTION,
      TIMEOUT_OPTION,
      { ...WAIT_UNTIL_OPTION, default: 'load' },
    ],
  },
  {
    displayName: 'Content POST Options',
    name: 'contentPostOptions',
    type: 'collection',
    placeholder: 'Add advanced option',
    default: {},
    displayOptions: {
      show: { operation: ['contentPost'] },
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

export async function contentGet(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const opt = this.getNodeParameter('contentGetOptions', i, {}) as IDataObject;
  const enablePreview = opt.enablePreview as boolean || false;

  // Remove enablePreview from options sent to API
  const { enablePreview: _, ...apiOptions } = opt;

  const content = await headlessxApiRequest.call(this, {
    method: 'GET',
    url: '/api/content',
    qs: { url, ...apiOptions },
    json: true, // Keep as JSON to get proper string response
  });

  const contentData = typeof content === 'object' && content.data ? content.data : content;

  const result: INodeExecutionData = {
    json: {
      url,
      contentLength: typeof contentData === 'string' ? contentData.length : 0,
      timestamp: new Date().toISOString(),
      success: true,
      previewMode: enablePreview,
    },
  };

  if (enablePreview && typeof contentData === 'string') {
    try {
      // Always provide binary data for download/preview like PDF/Screenshot
      const fileName = `content_${Date.now()}.txt`;
      const buffer = Buffer.from(contentData, 'utf8');

      // Use proper n8n binary data preparation with explicit property name
      const binaryPropertyName = 'data';
      const binaryData = await this.helpers.prepareBinaryData(
        buffer,
        fileName,
        'text/plain'
      );

      result.binary = {
        [binaryPropertyName]: binaryData
      };

      // Also include summary in JSON for quick reference
      result.json.preview = {
        type: 'text',
        fileName: fileName,
        summary: contentData.substring(0, 300) + (contentData.length > 300 ? '...' : ''),
        fullLength: contentData.length,
        note: 'Full text content available in binary data section for download/preview'
      };
    } catch (error) {
      // Fallback: if binary data creation fails, just return content in JSON
      result.json.content = contentData;
      result.json.previewError = `Failed to create binary preview: ${(error as Error).message}`;
    }
  } else {
    // Return as JSON (default behavior)
    result.json.content = contentData;
  }

  return [result];
}

export async function contentPost(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const adv = this.getNodeParameter('contentPostOptions', i, {}) as IDataObject;
  const enablePreview = adv.enablePreview as boolean || false;

  // Remove enablePreview from options sent to API
  const { enablePreview: _, ...apiOptions } = adv;

  const content = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/content',
    body: { url, ...apiOptions },
    json: true, // Keep as JSON to get proper string response
  });

  const contentData = typeof content === 'object' && content.data ? content.data : content;

  const result: INodeExecutionData = {
    json: {
      url,
      contentLength: typeof contentData === 'string' ? contentData.length : 0,
      options: adv,
      timestamp: new Date().toISOString(),
      success: true,
      previewMode: enablePreview,
    },
  };

  if (enablePreview && typeof contentData === 'string') {
    try {
      // Always provide binary data for download/preview like PDF/Screenshot
      const fileName = `content_${Date.now()}.txt`;
      const buffer = Buffer.from(contentData, 'utf8');

      // Use proper n8n binary data preparation with explicit property name
      const binaryPropertyName = 'data';
      const binaryData = await this.helpers.prepareBinaryData(
        buffer,
        fileName,
        'text/plain'
      );

      result.binary = {
        [binaryPropertyName]: binaryData
      };

      // Also include summary in JSON for quick reference
      result.json.preview = {
        type: 'text',
        fileName: fileName,
        summary: contentData.substring(0, 300) + (contentData.length > 300 ? '...' : ''),
        fullLength: contentData.length,
        note: 'Full text content available in binary data section for download/preview'
      };
    } catch (error) {
      // Fallback: if binary data creation fails, just return content in JSON
      result.json.content = contentData;
      result.json.previewError = `Failed to create binary preview: ${(error as Error).message}`;
    }
  } else {
    // Return as JSON (default behavior)
    result.json.content = contentData;
  }

  return [result];
}// Main execute function for unified interface
export async function execute(this: IExecuteFunctions, itemIndex: number): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', itemIndex) as string;

  if (operation === 'contentGet') {
    return await contentGet.call(this, itemIndex);
  } else if (operation === 'contentPost') {
    return await contentPost.call(this, itemIndex);
  } else {
    throw new NodeOperationError(this.getNode(), `Unknown content operation: ${operation}`, { itemIndex });
  }
}
