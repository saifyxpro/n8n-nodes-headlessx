# Contributing to n8n-nodes-headlessx

Thank you for your interest in contributing to the HeadlessX n8n community node! We welcome contributions from the community and are pleased to have you join us.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20.15 or higher
- **npm**: Latest stable version
- **Git**: For version control
- **n8n**: For testing the node
- **HeadlessX**: Running instance for testing

### Development Environment Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/n8n-nodes-headlessx.git
   cd n8n-nodes-headlessx
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Linting**
   ```bash
   npm run lint
   ```

## 🛠️ Development Workflow

### Project Structure
```
n8n-nodes-headlessx/
├── credentials/                 # Credential types
│   └── HeadlessXApi.credentials.ts
├── nodes/                      # Node implementations
│   └── HeadlessX/
│       ├── HeadlessX.node.ts   # Main node logic
│       └── headlessx.svg       # Node icon
├── dist/                       # Compiled output
├── assets/                     # Static assets
├── package.json               # Package configuration
├── tsconfig.json              # TypeScript config
├── gulpfile.js               # Build configuration
└── README.md                 # Documentation
```

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow TypeScript best practices
   - Maintain consistent code style
   - Add appropriate comments
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   # Build the project
   npm run build
   
   # Run linting
   npm run lint
   
   # Test in n8n (link locally)
   npm link
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

## 📝 Code Style Guidelines

### TypeScript Standards
- Use TypeScript strict mode
- Provide explicit type annotations where helpful
- Use interfaces for object structures
- Follow n8n's INodeType patterns

### Naming Conventions
- **Variables**: camelCase (`myVariable`)
- **Functions**: camelCase (`processData`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINT`)
- **Interfaces**: PascalCase with 'I' prefix (`IMyInterface`)
- **Classes**: PascalCase (`MyClass`)

### Code Organization
- Keep functions focused and small
- Use descriptive variable names
- Add JSDoc comments for complex functions
- Group related functionality together

### Example Code Style
```typescript
interface IOperationConfig {
	endpoint: string;
	method: 'GET' | 'POST';
	requiresAuth: boolean;
}

/**
 * Processes the API request based on operation configuration
 */
async function processApiRequest(
	this: IExecuteFunctions,
	config: IOperationConfig,
	parameters: IDataObject,
): Promise<INodeExecutionData[]> {
	// Implementation here
}
```

## 🧪 Testing Guidelines

### Manual Testing
1. **Set up test environment**
   - Run HeadlessX server locally
   - Install the node in n8n
   - Create test workflows

2. **Test scenarios to cover**
   - All operation types
   - Error conditions
   - Authentication methods
   - Binary data handling
   - Parameter validation

3. **Cross-platform testing**
   - Test on different operating systems
   - Verify with different n8n versions
   - Check with various HeadlessX configurations

### Testing Checklist
- [ ] All operations work correctly
- [ ] Error messages are helpful
- [ ] Authentication works with different methods
- [ ] Binary data (screenshots/PDFs) downloads properly
- [ ] Parameter validation prevents invalid inputs
- [ ] Documentation matches actual behavior

## 📋 Pull Request Process

### Before Submitting
1. **Code Quality**
   - [ ] Code builds without errors (`npm run build`)
   - [ ] Linting passes (`npm run lint`)
   - [ ] Code follows style guidelines
   - [ ] No unnecessary dependencies added

2. **Documentation**
   - [ ] README updated if needed
   - [ ] Code comments added for complex logic
   - [ ] CHANGELOG updated for significant changes

3. **Testing**
   - [ ] Manual testing completed
   - [ ] No regressions introduced
   - [ ] New features tested thoroughly

### Submitting Your PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use descriptive title
   - Reference any related issues
   - Provide detailed description of changes
   - Include testing notes

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes made.

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement

   ## Testing
   - [ ] Manual testing completed
   - [ ] All operations work correctly
   - [ ] No regressions found

   ## Related Issues
   Closes #123
   ```

## 🐛 Bug Reports

When reporting bugs, please include:

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- n8n version: 
- Node version:
- HeadlessX version:
- Operating System:

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

We welcome feature requests! Please provide:

### Feature Request Template
```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Describe the problem this feature would solve.

**Proposed Solution**
How you envision this feature working.

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Any other context or screenshots.
```

## 📚 Development Resources

### n8n Development
- [n8n Community Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Node Development Guidelines](https://docs.n8n.io/integrations/creating-nodes/build/node/)
- [n8n TypeScript Types](https://github.com/n8n-io/n8n/tree/master/packages/workflow)

### HeadlessX API
- [HeadlessX Documentation](https://github.com/SaifyXPRO/HeadlessX)
- [API Reference](https://github.com/SaifyXPRO/HeadlessX/blob/main/API.md)
- [HeadlessX Examples](https://github.com/SaifyXPRO/HeadlessX/tree/main/examples)

### Tools & Libraries
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Puppeteer API](https://pptr.dev/)

## 🏆 Recognition

Contributors will be recognized in:
- README.md acknowledgments
- Release notes for significant contributions
- GitHub contributors page

## 📞 Getting Help

If you need help with development:

1. **Check existing issues** for similar questions
2. **Review documentation** for guidance
3. **Create a discussion** for general questions
4. **Open an issue** for specific problems

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to n8n-nodes-headlessx! 🎉
