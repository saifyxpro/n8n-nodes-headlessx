import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions, IHttpRequestMethods } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

export const option: INodePropertyOptions = {
    name: 'Profile',
    value: 'profile',
    description: 'Manage HeadlessX Browser Profiles',
};

const profileOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['profile'],
            },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                description: 'Create a new browser profile',
                action: 'Create a profile',
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Delete a profile',
                action: 'Delete a profile',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get a specific profile',
                action: 'Get a profile',
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get many profiles',
                action: 'Get many profiles',
            },
            {
                name: 'Launch',
                value: 'launch',
                description: 'Launch a profile in a browser',
                action: 'Launch a profile',
            },
            {
                name: 'Stop',
                value: 'stop',
                description: 'Stop a running profile',
                action: 'Stop a profile',
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update a profile',
                action: 'Update a profile',
            },
        ],
        default: 'getAll',
    },
];

const profileFields: INodeProperties[] = [
    /* -------------------------------------------------------------------------- */
    /*                                 profile:create                             */
    /* -------------------------------------------------------------------------- */
    {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['profile'],
                operation: ['create'],
            },
        },
        description: 'Name of the profile',
    },
    {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                resource: ['profile'],
                operation: ['create'],
            },
        },
        description: 'Description of the profile',
    },
    {
        displayName: 'User Agent',
        name: 'userAgent',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                resource: ['profile'],
                operation: ['create'],
            },
        },
        description: 'Custom User Agent (optional)',
    },
    {
        displayName: 'Proxy ID',
        name: 'proxyId',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                resource: ['profile'],
                operation: ['create'],
            },
        },
        description: 'ID of the proxy to use with this profile',
    },

    /* -------------------------------------------------------------------------- */
    /*                                 profile:update                             */
    /* -------------------------------------------------------------------------- */
    {
        displayName: 'Profile ID',
        name: 'profileId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['profile'],
                operation: ['update', 'get', 'delete', 'launch', 'stop'],
            },
        },
        description: 'The ID of the profile',
    },
    {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['profile'],
                operation: ['update'],
            },
        },
        options: [
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
            },
            {
                displayName: 'User Agent',
                name: 'userAgent',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Proxy ID',
                name: 'proxyId',
                type: 'string',
                default: '',
            },
        ],
    },

    /* -------------------------------------------------------------------------- */
    /*                                 profile:getAll                             */
    /* -------------------------------------------------------------------------- */
    {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['profile'],
                operation: ['getAll'],
            },
        },
        default: false,
        description: 'Whether to return all results or only up to a given limit',
    },
    {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        displayOptions: {
            show: {
                resource: ['profile'],
                operation: ['getAll'],
                returnAll: [false],
            },
        },
        typeOptions: {
            minValue: 1,
        },
        default: 50,
        description: 'Max number of results to return',
    },
];

export const properties: INodeProperties[] = [
    ...profileOperations,
    ...profileFields,
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
    const operation = this.getNodeParameter('operation', i) as string;

    let responseData;
    let requestMethod: IHttpRequestMethods = 'GET';
    let endpoint = '';
    let body: IDataObject = {};
    let qs: IDataObject = {};

    if (operation === 'create') {
        requestMethod = 'POST';
        endpoint = '/api/profiles';
        body = {
            name: this.getNodeParameter('name', i) as string,
            description: this.getNodeParameter('description', i) as string,
            userAgent: this.getNodeParameter('userAgent', i) as string,
            proxyId: this.getNodeParameter('proxyId', i) as string,
        };
    } else if (operation === 'update') {
        requestMethod = 'PATCH';
        const profileId = this.getNodeParameter('profileId', i) as string;
        endpoint = `/api/profiles/${profileId}`;
        body = this.getNodeParameter('updateFields', i) as IDataObject;
    } else if (operation === 'delete') {
        requestMethod = 'DELETE';
        const profileId = this.getNodeParameter('profileId', i) as string;
        endpoint = `/api/profiles/${profileId}`;
    } else if (operation === 'get') {
        requestMethod = 'GET';
        const profileId = this.getNodeParameter('profileId', i) as string;
        endpoint = `/api/profiles/${profileId}`;
    } else if (operation === 'getAll') {
        requestMethod = 'GET';
        endpoint = '/api/profiles';
        const returnAll = this.getNodeParameter('returnAll', i) as boolean;
        if (!returnAll) {
            qs.limit = this.getNodeParameter('limit', i) as number;
        }
    } else if (operation === 'launch') {
        requestMethod = 'POST';
        const profileId = this.getNodeParameter('profileId', i) as string;
        endpoint = `/api/profiles/${profileId}/launch`;
    } else if (operation === 'stop') {
        requestMethod = 'POST';
        const profileId = this.getNodeParameter('profileId', i) as string;
        endpoint = `/api/profiles/${profileId}/stop`;
    }

    responseData = await headlessxApiRequest.call(this, {
        method: requestMethod,
        url: endpoint,
        body,
        qs,
        json: true,
    });

    // Normalize 'getAll' response to array
    if (operation === 'getAll' && responseData.data && Array.isArray(responseData.data)) {
        responseData = responseData.data;
    } else if (operation === 'getAll' && Array.isArray(responseData)) {
        // already array
    } else {
        responseData = [responseData];
    }

    return this.helpers.returnJsonArray(responseData as IDataObject[]);
}
