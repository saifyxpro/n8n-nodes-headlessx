// Simple test to verify HeadlessX node execution
const { HeadlessX } = require('./dist/nodes/HeadlessX/HeadlessX.node.js');

console.log('HeadlessX Node Test');
console.log('==================');

// Test 1: Node class instantiation
try {
    const nodeInstance = new HeadlessX();
    console.log('✓ Node instantiation: PASSED');
    console.log('  - Node name:', nodeInstance.description.name);
    console.log('  - Display name:', nodeInstance.description.displayName);
    console.log('  - Version:', nodeInstance.description.version);
    console.log('  - Operations available:', nodeInstance.description.properties.find(p => p.name === 'operation')?.options?.length || 0);
} catch (error) {
    console.log('✗ Node instantiation: FAILED');
    console.log('  Error:', error.message);
}

// Test 2: Node properties validation
try {
    const nodeInstance = new HeadlessX();
    const requiredProps = ['operation', 'url', 'postUrl'];
    const availableProps = nodeInstance.description.properties.map(p => p.name);

    const missingProps = requiredProps.filter(prop => !availableProps.includes(prop));
    if (missingProps.length === 0) {
        console.log('✓ Node properties: PASSED');
        console.log('  - All required properties found');
    } else {
        console.log('✗ Node properties: FAILED');
        console.log('  - Missing properties:', missingProps);
    }
} catch (error) {
    console.log('✗ Node properties: FAILED');
    console.log('  Error:', error.message);
}

// Test 3: Credentials configuration
try {
    const nodeInstance = new HeadlessX();
    const credentials = nodeInstance.description.credentials;
    if (credentials && credentials.length > 0 && credentials[0].name === 'headlessXApi') {
        console.log('✓ Credentials config: PASSED');
        console.log('  - Credential name:', credentials[0].name);
    } else {
        console.log('✗ Credentials config: FAILED');
        console.log('  - Invalid credentials configuration');
    }
} catch (error) {
    console.log('✗ Credentials config: FAILED');
    console.log('  Error:', error.message);
}

console.log('\n📋 Test completed. If all tests passed, the node structure is correct.');
console.log('🚀 To test full execution, deploy to n8n and test with real API calls.');
