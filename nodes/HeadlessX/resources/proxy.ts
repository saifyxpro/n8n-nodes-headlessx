import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions, IHttpRequestMethods } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

export const option: INodePropertyOptions = {
    name: 'Proxy',
    value: 'proxy',
    description: 'Manage HeadlessX Proxies',
};

const proxyOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['proxy'],
            },
        },
        options: [
            {
                name: 'Check Connection',
                value: 'test',
                description: 'Test if a proxy is working',
                action: 'Check proxy connection',
            },
            {
                name: 'Create',
                value: 'create',
                description: 'Add a new proxy',
                action: 'Create a proxy',
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Remove a proxy',
                action: 'Delete a proxy',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get a specific proxy',
                action: 'Get a proxy',
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get many proxies',
                action: 'Get many proxies',
            },
            {
                name: 'Toggle Active',
                value: 'toggle',
                description: 'Enable or disable a proxy',
                action: 'Toggle proxy',
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update a proxy',
                action: 'Update a proxy',
            },
        ],
        default: 'getAll',
    },
];

const proxyFields: INodeProperties[] = [
    /* -------------------------------------------------------------------------- */
    /*                                 proxy:create                               */
    /* -------------------------------------------------------------------------- */
    {
        displayName: 'Protocol',
        name: 'protocol',
        type: 'options',
        options: [
            { name: 'HTTP', value: 'http' },
            { name: 'HTTPS', value: 'https' },
            { name: 'SOCKS4', value: 'socks4' },
            { name: 'SOCKS5', value: 'socks5' },
        ],
        default: 'http',
        required: true,
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Host',
        name: 'host',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['create'],
            },
        },
        description: 'Proxy IP or hostname',
    },
    {
        displayName: 'Port',
        name: 'port',
        type: 'number',
        required: true,
        default: 8080,
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        typeOptions: { password: true },
        default: '',
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['create'],
            },
        },
        description: 'Friendly name for the proxy',
    },

    /* -------------------------------------------------------------------------- */
    /*                                 proxy:update                               */
    /* -------------------------------------------------------------------------- */
    {
        displayName: 'Proxy ID',
        name: 'proxyId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['update', 'get', 'delete', 'toggle', 'test'],
            },
        },
    },
    {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['update'],
            },
        },
        options: [
            {
                displayName: 'Host',
                name: 'host',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Password',
                name: 'password',
                type: 'string',
                typeOptions: { password: true },
                default: '',
            },
            {
                displayName: 'Port',
                name: 'port',
                type: 'number',
                default: 0,
            },
            {
                displayName: 'Protocol',
                name: 'protocol',
                type: 'options',
                options: [
                    { name: 'HTTP', value: 'http' },
                    { name: 'HTTPS', value: 'https' },
                    { name: 'SOCKS4', value: 'socks4' },
                    { name: 'SOCKS5', value: 'socks5' },
                ],
                default: 'http',
            },
            {
                displayName: 'Username',
                name: 'username',
                type: 'string',
                default: '',
            },
        ],
    },

    /* -------------------------------------------------------------------------- */
    /*                                 proxy:getAll                               */
    /* -------------------------------------------------------------------------- */
    {
        displayName: 'Active Only',
        name: 'activeOnly',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: ['proxy'],
                operation: ['getAll'],
            },
        },
        description: 'Whether to return only active proxies',
    },
];

export const properties: INodeProperties[] = [
    ...proxyOperations,
    ...proxyFields,
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
        endpoint = '/api/proxies';
        body = {
            protocol: this.getNodeParameter('protocol', i) as string,
            host: this.getNodeParameter('host', i) as string,
            port: this.getNodeParameter('port', i) as number,
            username: this.getNodeParameter('username', i) as string,
            password: this.getNodeParameter('password', i) as string,
            name: this.getNodeParameter('name', i) as string,
        };
    } else if (operation === 'update') {
        requestMethod = 'PATCH';
        const proxyId = this.getNodeParameter('proxyId', i) as string;
        endpoint = `/api/proxies/${proxyId}`;
        body = this.getNodeParameter('updateFields', i) as IDataObject;
    } else if (operation === 'delete') {
        requestMethod = 'DELETE';
        const proxyId = this.getNodeParameter('proxyId', i) as string;
        endpoint = `/api/proxies/${proxyId}`;
    } else if (operation === 'get') {
        requestMethod = 'GET';
        const proxyId = this.getNodeParameter('proxyId', i) as string;
        endpoint = `/api/proxies/${proxyId}`;
    } else if (operation === 'getAll') {
        requestMethod = 'GET';
        const activeOnly = this.getNodeParameter('activeOnly', i) as boolean;
        endpoint = activeOnly ? '/api/proxies/active' : '/api/proxies';
    } else if (operation === 'toggle') {
        requestMethod = 'POST';
        const proxyId = this.getNodeParameter('proxyId', i) as string;
        endpoint = `/api/proxies/${proxyId}/toggle`;
    } else if (operation === 'test') {
        requestMethod = 'POST';
        const proxyId = this.getNodeParameter('proxyId', i) as string;
        endpoint = `/api/proxies/${proxyId}/test`;
    }

    responseData = await headlessxApiRequest.call(this, {
        method: requestMethod,
        url: endpoint,
        body,
        qs,
        json: true,
    });

    // Normalize 'getAll' response
    if (operation === 'getAll' && responseData.data && Array.isArray(responseData.data)) {
        responseData = responseData.data;
    } else if (operation === 'getAll' && Array.isArray(responseData)) {
        // already array or different shape
    } else {
        responseData = [responseData];
    }

    return this.helpers.returnJsonArray(responseData as IDataObject[]);
}
