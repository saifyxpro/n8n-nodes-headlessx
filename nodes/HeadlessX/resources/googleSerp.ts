import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';
import { TIMEOUT_OPTION } from './shared/commonOptions';

export const option: INodePropertyOptions = {
    name: 'Google SERP Search',
    value: 'googleSerp',
    description: 'Extract Google search results with anti-detection',
    action: 'Google SERP search',
};

export const properties: INodeProperties[] = [
    {
        displayName: 'Search Query',
        name: 'query',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'web scraping tools',
        description: 'The search query to send to Google',
        displayOptions: {
            show: {
                resource: ['googleSerp'],
                operation: ['search']
            }
        },
    },
    {
        displayName: 'Profile ID',
        name: 'profileId',
        type: 'string',
        default: '',
        description: 'ID of the browser profile to use for the search',
        displayOptions: {
            show: {
                resource: ['googleSerp'],
                operation: ['search']
            }
        },
    },
    {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: {
            show: {
                resource: ['googleSerp'],
                operation: ['search']
            }
        },
        options: [
            TIMEOUT_OPTION,
        ],
    },
];

const operations: INodeProperties = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
        show: {
            resource: ['googleSerp'],
        },
    },
    options: [
        {
            name: 'Search',
            value: 'search',
            description: 'Perform a Google search',
            action: 'Search Google',
        },
    ],
    default: 'search',
};

export const allProperties = [
    operations,
    ...properties
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
    const query = this.getNodeParameter('query', i) as string;
    const profileId = this.getNodeParameter('profileId', i) as string;
    const options = this.getNodeParameter('options', i, {}) as IDataObject;

    if (!query || !query.trim()) {
        throw new NodeOperationError(this.getNode(), 'Search query is required', { itemIndex: i });
    }

    const body: IDataObject = {
        query: query.trim(),
    };

    if (profileId) {
        body.profileId = profileId;
    }

    try {
        const response = await headlessxApiRequest.call(this, {
            method: 'POST',
            url: '/api/google-serp/search',
            body,
            json: true,
            timeout: Number(options.timeout) || 60000,
        });

        const results = response?.data || response;

        return [{
            json: {
                success: true,
                query,
                timestamp: new Date().toISOString(),
                data: results,
            },
        } satisfies INodeExecutionData];
    } catch (error) {
        throw new NodeOperationError(this.getNode(), `Google SERP failed: ${(error as Error).message}`, { itemIndex: i });
    }
}
