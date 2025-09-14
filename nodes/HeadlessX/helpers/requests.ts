import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, IHttpRequestMethods } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export interface HeadlessXRequestOptions {
  method: IHttpRequestMethods;
  url: string; // endpoint path, e.g. '/api/html'
  baseURL?: string;
  qs?: IDataObject;
  body?: IDataObject;
  json?: boolean; // default true
  encoding?: string | null; // for binary responses
  timeout?: number;
  returnFullResponse?: boolean;
}

export async function headlessxApiRequest(
  this: IExecuteFunctions,
  opts: HeadlessXRequestOptions,
) {
  const credentials = (await this.getCredentials('headlessXApi')) as IDataObject;
  const baseURL = opts.baseURL || (credentials?.baseUrl as string) || '';

  const options: IHttpRequestOptions = {
    method: opts.method,
    url: opts.url,
    baseURL,
    qs: opts.qs && Object.keys(opts.qs).length ? opts.qs : undefined,
    body: opts.body && Object.keys(opts.body).length ? opts.body : undefined,
    json: opts.json ?? true,
  };

  if (opts.encoding !== undefined) {
    (options as any).encoding = opts.encoding;
  }
  if (opts.timeout) {
    options.timeout = opts.timeout;
  }
  if (opts.returnFullResponse) {
    (options as any).returnFullResponse = true;
  }

  try {
    return await this.helpers.requestWithAuthentication.call(this, 'headlessXApi', options);
  } catch (error) {
    // Surface rich axios details
    const e: any = error;
    const details = {
      ...e,
      request: e?.cause?.request
        ? {
            path: e?.cause?.request?.path,
            _headers: e?.cause?.request?._headers,
          }
        : undefined,
      response: e?.cause?.response
        ? {
            status: e?.cause?.response?.status,
            data: e?.cause?.response?.data,
          }
        : undefined,
      config: e?.cause?.config
        ? {
            baseURL: e?.cause?.config?.baseURL ?? baseURL,
            url: e?.cause?.config?.url,
            method: e?.cause?.config?.method,
          }
        : { baseURL, url: opts.url, method: opts.method },
      message: e?.message,
    };
    throw new NodeApiError(this.getNode(), details);
  }
}
