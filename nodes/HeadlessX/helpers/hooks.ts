import {
  IDataObject,
  IExecuteSingleFunctions,
  IHttpRequestOptions,
} from 'n8n-workflow';

export async function preSendActionCustomBody(
  this: IExecuteSingleFunctions,
  requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
  const { customBody } = requestOptions.body as IDataObject;

  if (
    typeof requestOptions.body === 'object' &&
    typeof customBody === 'object'
  ) {
    requestOptions.body = {
      ...requestOptions.body,
      ...customBody,
    };
    delete (requestOptions.body as IDataObject).customBody;
  }

  return Promise.resolve(requestOptions);
}
