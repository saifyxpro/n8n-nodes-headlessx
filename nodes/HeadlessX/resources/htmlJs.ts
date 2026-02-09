import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';
import { PREVIEW_OPTION, TIMEOUT_OPTION, WAIT_UNTIL_OPTION, EXTRA_WAIT_TIME_OPTION, HEADERS_OPTION, USER_AGENT_OPTION } from './shared/commonOptions';

export const option: INodePropertyOptions = {
    name: 'Extract HTML (JS Rendered)',
    value: 'htmlJs',
    description: 'Extract HTML with full JavaScript rendering',
    action: 'Extract HTML with JS',
};

export const properties: INodeProperties[] = [
    {
        displayName: 'HTML JS Options',
        name: 'htmlJsOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
            show: { operation: ['htmlJs'] },
        },
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

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
    const url = this.getNodeParameter('url', i) as string;
    const opt = this.getNodeParameter('htmlJsOptions', i, {}) as IDataObject;
    const enablePreview = opt.enablePreview as boolean || false;
    const profileId = opt.profileId as string;

    // Construct options object
    const options: IDataObject = {};
    if (opt.waitForSelector) options.waitForSelector = opt.waitForSelector;
    if (opt.timeout) options.waitForTimeout = opt.timeout; // Backend uses waitForTimeout for wait logic
    if (opt.stealth !== undefined) options.stealth = opt.stealth;
    if (opt.proxy) options.proxy = opt.proxy;
    if (opt.screenshotOnError !== undefined) options.screenshotOnError = opt.screenshotOnError;

    const body: IDataObject = {
        url,
        options,
    };

    if (profileId) {
        body.profileId = profileId;
    }

    const response = await headlessxApiRequest.call(this, {
        method: 'POST',
        url: '/api/website/html-js',
        body,
        json: true,
    });

    const htmlContent = typeof response === 'object' && response.data ? response.data : response;

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
            const fileName = `webpage_js_${Date.now()}.html`;
            const buffer = Buffer.from(htmlContent, 'utf8');
            const binaryData = await this.helpers.prepareBinaryData(buffer, fileName, 'text/html');

            result.binary = { data: binaryData };
            result.json.preview = {
                fileName,
                summary: htmlContent.substring(0, 500) + '...',
            };
        } catch (error) {
            // ignore binary error
        }
    } else {
        result.json.html = htmlContent;
    }

    return [result];
}
