# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this n8n community node, please report it responsibly:

### How to Report

1. **Do not** create a public issue for security vulnerabilities
2. Send an email to the maintainer with details about the vulnerability
3. Include steps to reproduce the issue
4. Provide information about the potential impact

### What to Include

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any suggested fixes or mitigations
- Your contact information for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution Target**: Within 30 days for critical issues

### Security Best Practices

When using this node:

1. **Secure your HeadlessX API server**:
   - Use HTTPS in production
   - Implement proper authentication
   - Keep your HeadlessX instance updated
   - Restrict network access appropriately

2. **Protect your credentials**:
   - Store API tokens securely in n8n credentials
   - Use environment variables for sensitive data
   - Regularly rotate API keys
   - Don't hardcode credentials in workflows

3. **Validate inputs**:
   - Sanitize URLs before processing
   - Validate file uploads and downloads
   - Be cautious with user-provided content

4. **Monitor usage**:
   - Log important operations
   - Monitor for unusual activity
   - Set up appropriate rate limiting

## Acknowledgments

We appreciate security researchers and the community for helping keep this project secure.
