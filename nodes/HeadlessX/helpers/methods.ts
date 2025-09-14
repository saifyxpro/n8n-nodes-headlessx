import type { INodeType } from 'n8n-workflow';

type IMethodModule = INodeType['methods'];

export const methods: INodeType['methods'] = ((): IMethodModule => {
  // Placeholder for future hooks (loadOptions, credentialTest, preSend, etc.)
  // Keeping structure aligned with Browserless v2 so we can extend easily.
  return {} as IMethodModule;
})();
