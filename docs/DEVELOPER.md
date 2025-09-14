# Developer Guide for n8n-nodes-headlessx

## 📁 Project Structure Overview

This guide explains the project structure and how to work with this n8n community node.

### Core Files Structure

```
n8n-nodes-headlessx/
├── 📁 nodes/                    # Node implementations
│   └── HeadlessX/
│       ├── HeadlessX.node.ts    # Main node logic
│       └── headlessx.svg        # Node icon
├── 📁 credentials/              # Authentication
│   └── HeadlessXApi.credentials.ts
├── 📁 dist/                     # Compiled output (auto-generated)
├── 📁 assets/icons/             # Source icons
├── 📁 examples/                 # Workflow examples
├── 📁 .github/                  # GitHub automation
│   ├── workflows/ci.yml         # CI/CD pipeline
│   └── ISSUE_TEMPLATE/          # Issue templates
├── package.json                 # npm configuration
├── tsconfig.json               # TypeScript config
├── gulpfile.js                 # Build automation
├── .eslintrc.js                # Linting rules
└── README.md                   # Documentation
```

## 🔧 Development Workflow

### Prerequisites
- Node.js 20.15+
- npm/yarn
- n8n installed globally
- HeadlessX API server for testing

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
npm run format       # Format code with Prettier
```

## 📝 File Purposes

### `nodes/HeadlessX/HeadlessX.node.ts`
**Main node implementation**
- Defines all 10 HeadlessX operations
- Handles API communication
- Manages error handling and validation
- Processes binary data (screenshots/PDFs)

### `credentials/HeadlessXApi.credentials.ts`
**Authentication management**
- Defines credential fields (baseUrl, token)
- Sets up multiple auth methods (X-Token, Bearer, Query)
- Includes credential testing logic

### `package.json` 
**n8n manifest and dependencies**
- Contains n8n-specific configuration
- Defines entry points for nodes and credentials
- Lists all dependencies and scripts

### Build Files
- `tsconfig.json` - TypeScript compilation settings
- `gulpfile.js` - Icon processing automation
- `.eslintrc.js` - Code quality rules with n8n standards

## 🎯 Key Development Patterns

### Node Operation Structure
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const operation = this.getNodeParameter('operation', 0) as string;
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
        try {
            const result = await this.helpers.httpRequestWithAuthentication.call(
                this,
                'headlessXApi',
                requestOptions
            );
            
            returnData.push({ json: result });
        } catch (error) {
            // Handle errors appropriately
        }
    }
    
    return [returnData];
}
```

### Error Handling Best Practices
```typescript
try {
    // API call logic
} catch (error) {
    if (this.continueOnFail()) {
        returnData.push({ 
            json: { error: error.message },
            pairedItem: { item: i }
        });
    } else {
        throw new NodeApiError(this.getNode(), error);
    }
}
```

### Binary Data Handling
```typescript
// For screenshots and PDFs
const binaryData = await this.helpers.prepareBinaryData(
    Buffer.from(result, 'base64'),
    `screenshot-${Date.now()}.png`,
    'image/png'
);

returnData.push({
    json: { success: true },
    binary: { data: binaryData },
    pairedItem: { item: i }
});
```

## 🧪 Testing Strategy

### Manual Testing
1. Build the project: `npm run build`
2. Link locally: `npm link`
3. Start n8n: `n8n start`
4. Create test workflows using each operation
5. Verify all operations work correctly

### API Integration Testing
```bash
node test-api.js  # Runs comprehensive API tests
```

### Automated Testing
- CI/CD runs on every PR
- Linting and build verification
- Automated npm publishing on releases

## 🔄 Release Process

### Version Management
1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Commit changes: `git commit -m "chore: bump version to x.x.x"`
4. Create tag: `git tag vx.x.x`
5. Push: `git push origin main --tags`

### Publishing
```bash
npm run build       # Ensure clean build
npm run lint        # Verify code quality
npm publish         # Publish to npm registry
```

## 🐛 Common Issues & Solutions

### Build Issues
- **TypeScript errors**: Check `tsconfig.json` and fix type issues
- **Icon processing fails**: Ensure SVG files are properly formatted
- **ESLint errors**: Run `npm run lintfix` for auto-fixes

### Runtime Issues
- **Authentication fails**: Verify HeadlessX server is running and token is valid
- **Binary data problems**: Check Buffer handling and MIME types
- **n8n not recognizing node**: Ensure `npm link` was run and n8n restarted

### Development Tips
- Use VS Code with n8n extension
- Keep n8n running in development mode
- Test each operation individually
- Monitor n8n logs for debugging

## 📚 Resources

- [n8n Node Development Documentation](https://docs.n8n.io/integrations/creating-nodes/)
- [HeadlessX API Documentation](https://github.com/SaifyXPRO/HeadlessX)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [n8n Community Forum](https://community.n8n.io/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following the coding standards
4. Test thoroughly
5. Submit pull request with detailed description

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).
