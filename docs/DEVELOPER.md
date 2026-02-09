# Developer Guide for n8n-nodes-headlessx

## 📁 Project Structure Overview

This guide explains the project structure and how to work with this n8n community node.

### Core Files Structure

```
n8n-nodes-headlessx/
├── 📁 nodes/                    # Node implementations
│   └── HeadlessX/
│       ├── HeadlessX.node.ts    # Main node logic
│       ├── HeadlessX.properties.ts  # Node properties
│       ├── HeadlessX.methods.ts # Helper methods
│       ├── headlessx.svg        # Node icon
│       ├── 📁 resources/        # Operation modules
│       │   ├── index.ts         # Operation exports
│       │   ├── html.ts          # HTML extraction
│       │   ├── htmlJs.ts        # HTML with JS rendering
│       │   ├── content.ts       # Content extraction
│       │   ├── screenshot.ts    # Screenshot capture
│       │   ├── googleSerp.ts    # Google SERP search
│       │   └── shared/          # Shared options
│       └── 📁 helpers/          # Helper utilities
│           └── requests.ts      # API request helper
├── 📁 credentials/              # Authentication
│   └── HeadlessXApi.credentials.ts
├── 📁 dist/                     # Compiled output (auto-generated)
├── 📁 docs/                     # Documentation
├── 📁 examples/                 # Workflow examples
├── package.json                 # npm configuration
├── tsconfig.json               # TypeScript config
└── README.md                   # Documentation
```

## 🎯 v2.0 Operations

| Operation    | File                      | Endpoint                       |
| ------------ | ------------------------- | ------------------------------ |
| `html`       | `resources/html.ts`       | `POST /api/website/html`       |
| `htmlJs`     | `resources/htmlJs.ts`     | `POST /api/website/html-js`    |
| `content`    | `resources/content.ts`    | `POST /api/website/content`    |
| `screenshot` | `resources/screenshot.ts` | `POST /api/website/screenshot` |
| `googleSerp` | `resources/googleSerp.ts` | `POST /api/google-serp/search` |

## 🔧 Development Workflow

### Prerequisites
- Node.js 20.15+
- npm/yarn
- n8n installed globally
- HeadlessX v2 API server for testing

### Setup
```bash
# Clone and install
git clone <your-fork>
cd n8n-nodes-headlessx
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

### Development Commands
```bash
npm run build        # Compile TypeScript and process icons
npm run dev          # Watch mode compilation
npm run lint         # Check code style
npm run lintfix      # Auto-fix linting issues
```

## 📝 Resource Module Structure

Each operation is defined in its own resource file:

```typescript
// resources/html.ts
import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { headlessxApiRequest } from '../helpers/requests';

// Operation definition for the dropdown
export const option: INodePropertyOptions = {
  name: 'Extract HTML',
  value: 'html',
  description: 'Extract raw HTML from a webpage',
  action: 'Extract HTML',
};

// Operation-specific options
export const properties: INodeProperties[] = [
  {
    displayName: 'HTML Options',
    name: 'htmlOptions',
    type: 'collection',
    // ... options
  },
];

// Execute function
export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
  const url = this.getNodeParameter('url', i) as string;
  const options = this.getNodeParameter('htmlOptions', i, {}) as IDataObject;

  const response = await headlessxApiRequest.call(this, {
    method: 'POST',
    url: '/api/website/html',
    body: { url, ...options },
    json: true,
  });

  return [{ json: { success: true, data: response } }];
}
```

## 🎯 Adding New Operations

1. **Create resource file** in `resources/`:
   ```typescript
   // resources/newOperation.ts
   export const option: INodePropertyOptions = { ... };
   export const properties: INodeProperties[] = [ ... ];
   export async function execute(...) { ... }
   ```

2. **Update index.ts**:
   ```typescript
   import * as newOperation from './newOperation.js';
   
   // Add to operations array
   const operations = [
     ...existingOperations,
     { ...newOperation.option, name: '🆕 New Operation' },
   ];
   
   // Add to properties
   export const rawProperties: INodeProperties[] = [
     ...existingProperties,
     ...newOperation.properties,
   ];
   ```

3. **Update HeadlessX.node.ts**:
   ```typescript
   import * as newOperation from './resources/newOperation';
   
   // Add case to switch
   case 'newOperation':
     results = await newOperation.execute.call(this, itemIndex);
     break;
   ```

## 🧪 Testing

### Manual Testing
1. Build: `npm run build`
2. Link: `npm link`
3. Start n8n: `n8n start`
4. Test each operation in a workflow

### API Endpoints
- Health: `GET /api/health`
- HTML: `POST /api/website/html`
- HTML-JS: `POST /api/website/html-js`
- Content: `POST /api/website/content`
- Screenshot: `POST /api/website/screenshot`
- Google SERP: `POST /api/google-serp/search`

## 🔄 Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Commit: `git commit -m "chore: bump version to x.x.x"`
4. Tag: `git tag vx.x.x`
5. Push: `git push origin main --tags`
6. Publish: `npm publish`

## 📚 Resources

- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [HeadlessX API Documentation](https://github.com/SaifyXPRO/HeadlessX)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
