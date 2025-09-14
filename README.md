# n8n-nodes-headlessx

![HeadlessX Logo](https://raw.githubusercontent.com/SaifyXPRO/HeadlessX/main/assets/logos/h-lettermark.svg)

[![npm version](https://badge.fury.io/js/n8n-nodes-headlessx.svg)](https://badge.fury.io/js/n8n-nodes-headlessx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-orange)](https://docs.n8n.io/integrations/community-nodes/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green)](https://github.com/your-repo/n8n-nodes-headlessx)
[![Version](https://img.shields.io/badge/Version-v1.1.2-blue)](https://github.com/SaifyXPRO/n8n-nodes-headlessx/releases)

An n8n community node for integrating with [HeadlessX](https://github.com/SaifyXPRO/HeadlessX) - a powerful headless browser API for web scraping, screenshot capture, and PDF generation.

> **✨ New in v1.1.2**: Enhanced UX with visual operation categories, emoji icons, advanced POST options, and improved user interface!

## 🚀 What is HeadlessX?

HeadlessX is a robust headless browser API built with Puppeteer that provides:

- **Web Scraping**: Extract HTML content and clean text from any webpage
- **Screenshot Capture**: Generate high-quality screenshots in multiple formats (PNG, JPEG, WebP)
- **PDF Generation**: Convert web pages to PDF documents with custom formatting
- **Batch Processing**: Handle multiple URLs concurrently for improved performance
- **Advanced Options**: Full control over browser behavior, waiting conditions, and page interactions
- **Human-like Behavior**: Simulate real user interactions to bypass anti-bot measures

> **📋 Important**: HeadlessX runs as a **separate API server** that you must install and run independently. This n8n node acts as a client to communicate with your HeadlessX server instance.
> 
> **🔗 Get HeadlessX**: [github.com/SaifyXPRO/HeadlessX](https://github.com/SaifyXPRO/HeadlessX)

## 📦 Installation

### ⚠️ Important Prerequisites

**Before installing this n8n node, you MUST have HeadlessX server running:**

1. **Install HeadlessX Server First**: 
   ```bash
   # Clone the HeadlessX repository
   git clone https://github.com/SaifyXPRO/HeadlessX.git
   cd HeadlessX
   
   # Install dependencies
   npm install
   
   # Start the HeadlessX server
   npm start
   ```
   📍 **Repository**: [github.com/SaifyXPRO/HeadlessX](https://github.com/SaifyXPRO/HeadlessX)

2. **n8n installed**: Follow the [n8n installation guide](https://docs.n8n.io/getting-started/installation/)

> **🚨 Critical**: This n8n community node is a **client** that connects to the HeadlessX API server. The HeadlessX server must be running and accessible before you can use this node in your n8n workflows.

### Install the Community Node

#### Option 1: Via n8n Community Nodes (Recommended)
1. Go to **Settings** → **Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter: `n8n-nodes-headlessx`
4. Click **Install**

#### Option 2: Via npm
```bash
npm install n8n-nodes-headlessx
```

#### Option 3: Manual Installation
1. Download or clone this repository
2. Copy the package to your n8n custom nodes directory:
   ```bash
   # Create custom nodes directory if it doesn't exist
   mkdir -p ~/.n8n/custom/
   
   # Copy the package
   cp -r n8n-nodes-headlessx ~/.n8n/custom/
   ```

  Windows (PowerShell) alternative:
  ```powershell
  # Create custom nodes directory if it doesn't exist
  New-Item -ItemType Directory -Force -Path "$HOME/.n8n/custom" | Out-Null

  # Copy the package
  Copy-Item -Recurse -Force .\n8n-nodes-headlessx "$HOME/.n8n/custom/"
  ```

#### Option 4: For n8n Docker Users
Add the package to your n8n Docker container:
```dockerfile
FROM n8nio/n8n
USER root
RUN npm install -g n8n-nodes-headlessx
USER node
```

## 🔧 Configuration

### 1. Set up HeadlessX API Credentials

1. In n8n, go to **Credentials** and create a new **HeadlessX API** credential
2. Configure the following:
   - **Base URL**: Your HeadlessX server URL (e.g., `http://localhost:3000`)
   - **API Token**: Your HeadlessX authentication token

### 2. Authentication Methods

The node supports multiple authentication methods:
- **Query Parameter**: `?token=YOUR_TOKEN`
- **Header Authentication**: `X-Token: YOUR_TOKEN`

Both methods are automatically applied for maximum compatibility.

### 3. Verify Your Setup

Before creating workflows, verify your setup is working:

1. **Check HeadlessX Server Status**:
   ```bash
   # Test if HeadlessX server is running
   curl http://localhost:3000/api/health
   # Should return: {"status":"ok","uptime":"..."}
   ```

2. **Test n8n Node Connection**:
   - Create a new workflow in n8n
   - Add a HeadlessX node
   - Select "Health Check" operation
   - Execute the node to verify connectivity

3. **Troubleshooting**:
   - Ensure HeadlessX server is running on the correct port
   - Check firewall/network connectivity between n8n and HeadlessX
   - Verify API token is correctly configured

## ⚙️ Configuration & Testing

### 1. Set up HeadlessX Credentials

1. In your n8n workflow, add the HeadlessX node
2. Click on "Create New Credential" 
3. Select "HeadlessX API"
4. Fill in the configuration:

| Field | Description | Example |
|-------|-------------|---------|
| **Base URL** | Your HeadlessX API endpoint (without /api) | `http://localhost:3000` |
| **API Token** | Your authentication token | `your-secret-token` |

### 2. Test the Connection

The credential automatically tests connectivity to your HeadlessX server:
- Tests the `/api/health` endpoint
- Verifies authentication is working
- Validates server response format

## 🎯 Available Operations

### 📊 Server Operations

#### Health Check
- **Endpoint**: `GET /api/health`
- **Purpose**: Check API server status and connectivity
- **Returns**: Server uptime, memory usage, and available features
- **Use case**: Monitor server health, validate connection

#### Server Status  
- **Endpoint**: `GET /api/status`
- **Purpose**: Get detailed server and browser information
- **Returns**: Server metrics, browser status, and performance data
- **Use case**: Debugging, performance monitoring

### 🌐 Web Scraping Operations

#### Extract HTML (GET)
- **Endpoint**: `GET /api/html`
- **Purpose**: Quick HTML extraction with query parameters
- **Best for**: Simple scraping tasks, fast extraction
- **Parameters**: URL, wait conditions, viewport settings
- **Returns**: Raw HTML content
- **Use case**: Basic page scraping, content extraction

#### Extract HTML (POST)
- **Endpoint**: `POST /api/html`  
- **Purpose**: Advanced HTML extraction with JSON configuration
- **Best for**: Complex scenarios requiring detailed browser control
- **Parameters**: Full browser options, custom headers, cookies
- **Returns**: Raw HTML content
- **Use case**: Advanced scraping, authentication required sites

#### Extract Text (GET)
- **Endpoint**: `GET /api/content`
- **Purpose**: Clean text extraction via GET request
- **Parameters**: URL, text extraction options
- **Returns**: Plain text content (no HTML tags)
- **Use case**: Content analysis, text processing workflows

#### Extract Text (POST)
- **Endpoint**: `POST /api/content`
- **Purpose**: Advanced text extraction with custom options
- **Parameters**: Advanced text processing, selectors, filters
- **Returns**: Clean, formatted text
- **Use case**: Data mining, content analysis with complex rules

### 📸 Screenshot Operations

#### Take Screenshot
- **Endpoint**: `GET /api/screenshot`
- **Purpose**: Capture webpage screenshots
- **Formats**: PNG, JPEG, WebP
- **Parameters**: 
  - **Dimensions**: Custom width/height
  - **Quality**: JPEG quality (1-100)
  - **Full Page**: Capture entire page or viewport only
  - **Device Emulation**: Mobile/tablet simulation
- **Returns**: Binary image data (handled automatically by n8n)
- **Use case**: Visual testing, documentation, monitoring

### 📄 PDF Operations

#### Generate PDF
- **Endpoint**: `GET /api/pdf`
- **Purpose**: Convert web pages to PDF documents
- **Parameters**:
  - **Format**: A4, A3, Letter, Legal, Tabloid
  - **Orientation**: Portrait or Landscape
  - **Margins**: Custom margin settings
  - **Headers/Footers**: Custom content
- **Returns**: Binary PDF data
- **Use case**: Report generation, document archiving

### 🔧 Advanced Operations

#### Custom Render
- **Endpoint**: `POST /api/render`
- **Purpose**: Advanced page rendering with custom JavaScript execution
- **Parameters**: Custom scripts, advanced waiting conditions
- **Returns**: JSON with custom data
- **Use case**: Dynamic content extraction, custom data processing

#### Batch Processing
- **Endpoint**: `POST /api/batch`
- **Purpose**: Process multiple URLs concurrently
- **Parameters**: Array of URLs, shared configuration
- **Returns**: Array of results
- **Use case**: Bulk processing, performance optimization

#### Generate PDF
- **Endpoint**: `GET /pdf`
- **Purpose**: Convert webpages to PDF documents
- **Options**: Paper format, orientation, margins, background graphics
- **Returns**: Binary PDF data

### 🔄 Advanced Operations

#### Full Page Render

## 🎨 Visual Interface & Screenshots

### Enhanced Operation Selection (v1.1.2)

The n8n-nodes-headlessx v1.1.2 features a completely redesigned user interface with visual operation categories, emoji icons, and smart organization for improved user experience.

#### 📊 Operation Categories

Operations are now organized into three logical categories:

**🔍 Content Extraction**
- 📄 Extract HTML (GET/POST) - Raw HTML scraping
- 📝 Extract Content (GET/POST) - Clean text extraction

**📸 Visual Capture** 
- 📸 Take Screenshot - High-quality page captures
- 📋 Generate PDF - Professional document generation

**⚡ Advanced Processing**
- 🎭 Advanced Render - Custom script execution  
- 🔄 Batch Processing - Multi-URL processing

### 📷 Operation Screenshots

#### Credential Configuration
Set up your HeadlessX API connection with easy credential management:

![Credential Success](assets/credential_success.png)
*Successful HeadlessX API credential configuration*

#### Extract HTML (GET) - Simple Web Scraping
Quick HTML extraction for basic scraping tasks:

![Extract HTML GET](assets/extract_html_get.png)
*Extract HTML using GET method with simple configuration*

#### Extract HTML (POST) - Advanced Web Scraping  
Advanced HTML extraction with comprehensive browser control:

![Extract HTML POST](assets/extract_html_post.png)
*Extract HTML using POST method with advanced options*

#### Extract Content (GET) - Clean Text Extraction
Extract readable text content from web pages:

![Extract Text GET](assets/extract_text_get.png)
*Extract clean text content using GET method*

#### Take Screenshot - Visual Page Capture
Capture high-quality screenshots with device emulation and format options:

![Take Screenshot](assets/take_screenshot.png)
*Screenshot capture with device emulation and quality controls*

#### Generate PDF - Document Creation
Convert web pages to professional PDF documents:

![Generate PDF](assets/generate_pdf.png)
*PDF generation with custom formatting options*

#### Advanced Render - Custom Processing
Execute custom scripts and advanced page interactions:

![Full Page Render](assets/full_page_render.png)
*Advanced page rendering with custom script execution*

### 🎯 Enhanced Features (v1.1.2)

#### Visual Operation Selection
- **📱 Emoji Icons**: Each operation features intuitive icons for quick recognition
- **🏷️ Smart Categories**: Operations grouped by functionality (Content, Visual, Advanced)
- **💡 Detailed Descriptions**: Enhanced tooltips and action descriptions
- **🎯 Smart Defaults**: Most common operation (HTML GET) pre-selected

#### Advanced POST Options
- **🔧 Comprehensive Controls**: All POST operations include advanced option collections
- **📊 Device Emulation**: Pre-configured device presets (Desktop, Mobile, Tablet)
- **🎨 Format Options**: Multiple image formats (PNG, JPEG, WebP) with quality controls
- **⚡ Performance Tuning**: Timeout controls, concurrency limits, error handling

#### Enhanced User Experience
- **✅ Real-time Validation**: URL validation with helpful error messages
- **📝 JSON Editor**: Built-in JSON editor for batch URL configuration
- **🔄 Error Recovery**: Improved error handling with context-aware messages
- **📋 Better Organization**: Alphabetical property ordering for easier navigation

## 📋 Example Workflows

### Example 1: Simple Web Scraping
```
Manual Trigger → HeadlessX (Extract HTML GET) → Code Node
```
**Configuration:**
1. **HeadlessX Node**: 
   - Operation: "Extract HTML (GET)"
   - URL: `https://example.com`
   - Timeout: 30000ms
2. **Code Node**: Process the HTML content
```javascript
// Extract title from HTML
const html = $input.first().json.data;
const titleMatch = html.match(/<title>(.*?)<\/title>/i);
return [{ title: titleMatch ? titleMatch[1] : 'No title found' }];
```

### Example 2: Screenshot for Monitoring
```
Schedule Trigger → HeadlessX (Take Screenshot) → Email
```
**Configuration:**
1. **Schedule Trigger**: Every hour
2. **HeadlessX Node**:
   - Operation: "Take Screenshot"
   - URL: `https://your-website.com`
   - Format: PNG
   - Full Page: true
3. **Email Node**: Send screenshot as attachment

### Example 3: Batch URL Processing
```
Webhook → HeadlessX (Batch Process) → Database
```
**Configuration:**
1. **Webhook**: Receives array of URLs
2. **HeadlessX Node**:
   - Operation: "Batch Process"
   - URLs: `{{ $json.urls }}`
   - Concurrent Requests: 3
3. **Database Node**: Store results

### Example 4: PDF Report Generation
```
HTTP Request → HeadlessX (Generate PDF) → Google Drive
```
**Configuration:**
1. **HTTP Request**: Get data for report
2. **HeadlessX Node**:
   - Operation: "Generate PDF"
   - URL: `https://report-generator.com/report?data={{ $json }}`
   - Format: A4
   - Orientation: Portrait
3. **Google Drive**: Save PDF report

### Example 5: Dynamic Content Extraction
```
Manual Trigger → HeadlessX (Custom Render) → Process Results
```
**Configuration:**
1. **HeadlessX Node**:
   - Operation: "Custom Render"
   - URL: `https://spa-website.com`
   - Wait for Selectors: `.dynamic-content`
   - Extra Wait: 2000ms
   - Custom Script: `document.querySelector('.load-more').click()`

## 🛠️ Configuration Options

### Basic Options (Available for all operations)
- **Timeout**: Navigation timeout in milliseconds (default: 30000)
- **Wait Until**: When to consider navigation complete
  - `load`: Wait for load event (recommended for static sites)
  - `domcontentloaded`: Wait for DOM ready (faster)
  - `networkidle0`: Wait for 0 network connections (comprehensive)
  - `networkidle2`: Wait for ≤2 network connections (balanced)
- **Extra Wait**: Additional wait time after page load (useful for SPAs)
- **Scroll**: Automatically scroll to bottom of page (triggers lazy loading)

### Advanced Options
- **Wait for Selectors**: CSS selectors to wait for before proceeding
- **Click Selectors**: Elements to click during page load
- **Remove Elements**: Elements to remove from the page (ads, modals)
- **Console Logs**: Include browser console output for debugging
- **Custom Headers**: Add authentication or custom headers
- **Cookies**: Set custom cookies for the session
- **User Agent**: Override default user agent
- **Viewport**: Custom viewport dimensions
- **Device Emulation**: Simulate mobile/tablet devices

### Screenshot-Specific Options
- **Full Page**: Capture entire page height (recommended for documentation)
- **Format**: Image format
  - **PNG**: Best quality, larger files
  - **JPEG**: Smaller files, good for photos
  - **WebP**: Modern format, best compression
- **Dimensions**: Custom width and height
- **Quality**: JPEG quality (1-100, default: 80)
- **Clip**: Capture specific area of the page
- **Background**: Include/exclude background colors

### PDF-Specific Options
- **Paper Format**: A4, A3, A5, Letter, Legal, Tabloid
- **Orientation**: Portrait or Landscape
- **Margins**: Custom page margins (top, right, bottom, left)
- **Background**: Include background graphics and colors
- **Scale**: Page scale factor (0.1-2.0)
- **Headers/Footers**: Custom header and footer content

### Example 2: Screenshot with Custom Options
```
Webhook → HeadlessX (Screenshot) → Save to File
```
1. Use "Take Screenshot" operation
2. Configure screenshot options:
   - Full Page: `true`
   - Format: `PNG`
   - Width: `1920`, Height: `1080`
3. Binary data is available for further processing

### Example 3: Batch PDF Generation
```
Spreadsheet → HeadlessX (Batch Process) → Email PDFs
```
1. Extract URLs from spreadsheet
2. Use "Batch Process" operation
3. Configure for PDF generation with concurrency control

### Example 4: Advanced Text Extraction
```
Schedule → HeadlessX (Extract Text POST) → Database
```
1. Use "Extract Text (POST)" operation
2. Configure advanced options:
   ```json
   {
     "waitUntil": "networkidle2",
     "extraWait": 2000,
     "removeElements": ".ads, .popup, .cookie-banner",
     "waitForSelectors": ".main-content"
   }
   ```

## 🔐 Authentication

HeadlessX supports multiple authentication methods:

### Query Parameter (Default)
## 🔐 Authentication Methods

The node supports multiple authentication methods for maximum compatibility:

### Query Parameter Authentication
```
GET /api/html?token=your-token&url=https://example.com
```

### Header Authentication  
```
X-Token: your-token
```

Both methods are automatically applied by the n8n node using your configured credentials.

## 🚨 Troubleshooting

### Common Issues and Solutions

#### ❌ "Couldn't connect with these settings"
**Cause**: Connection or authentication issue
**Solutions**:
1. Verify HeadlessX server is running: `curl http://localhost:3000/api/health`
2. Check Base URL format: Use `http://localhost:3000` (without `/api`)
3. Verify API token is correct
4. Check firewall/network settings

#### ❌ "Request timeout"
**Cause**: Page taking too long to load
**Solutions**:
1. Increase timeout value (default: 30000ms)
2. Use `domcontentloaded` instead of `load` for faster completion
3. Add `waitForSelectors` for specific elements
4. Check target website performance

#### ❌ "Element not found"
**Cause**: Dynamic content not loaded
**Solutions**:
1. Add extra wait time (2000-5000ms)
2. Use `networkidle0` wait condition
3. Add CSS selectors to wait for
4. Enable scrolling to trigger lazy loading

#### ❌ "Binary data error"
**Cause**: Large file handling issue
**Solutions**:
1. Increase n8n's payload size limit
2. Use compression for images (JPEG instead of PNG)
3. Reduce image dimensions
4. Use WebP format for better compression

### Performance Optimization

#### 🚀 Best Practices
1. **Use GET operations** for simple tasks (faster than POST)
2. **Batch processing** for multiple URLs (more efficient)
3. **Optimize wait conditions** (use fastest appropriate option)
4. **Cache results** when possible
5. **Use appropriate image formats** (WebP > JPEG > PNG for size)

#### ⚡ Speed Tips
- Use `domcontentloaded` for faster page detection
- Disable images when only text is needed
- Set appropriate timeouts (don't wait longer than necessary)
- Use concurrent batch processing for multiple URLs
- Remove unnecessary elements to reduce processing time

## 🔧 Advanced Configuration

### Environment Variables (HeadlessX Server)
```env
PORT=3000
API_TOKEN=your-secret-token
BROWSER_ARGS=--no-sandbox,--disable-dev-shm-usage
TIMEOUT_DEFAULT=30000
CONCURRENCY_LIMIT=10
MAX_MEMORY_USAGE=1024
```

### Docker Compose Example
```yaml
version: '3.8'
services:
  headlessx:
    image: saifyxpro/headlessx:latest
    ports:
      - "3000:3000"
    environment:
      - API_TOKEN=your-secret-token
      - TIMEOUT_DEFAULT=30000
      - CONCURRENCY_LIMIT=5
    volumes:
      - ./screenshots:/app/screenshots
    restart: unless-stopped

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - headlessx
    restart: unless-stopped

volumes:
  n8n_data:
```

## 📊 Performance Benchmarks

| Operation | Avg Response Time | Memory Usage | Best Use Case |
|-----------|------------------|--------------|---------------|
| Health Check | 10-50ms | Low | Monitoring |
| HTML GET | 100-2000ms | Medium | Simple scraping |
| HTML POST | 200-3000ms | Medium | Complex scraping |
| Screenshot | 500-5000ms | High | Visual documentation |
| PDF Generation | 1000-8000ms | High | Report generation |
| Batch (5 URLs) | 1000-10000ms | High | Bulk processing |

*Times vary based on target website complexity and server resources*

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
5. Lint code: `npm run lint`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- [n8n](https://n8n.io/) - The powerful workflow automation platform
- [HeadlessX](https://github.com/SaifyXPRO/HeadlessX) - The robust headless browser API
- [Puppeteer](https://pptr.dev/) - The headless Chrome API

## 📞 Support

- **Documentation**: [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- **Issues**: [GitHub Issues](https://github.com/SaifyXPRO/n8n-nodes-headlessx/issues)
- **HeadlessX Support**: [HeadlessX Repository](https://github.com/SaifyXPRO/HeadlessX)

---

**Made with ❤️ by [SaifyXPRO](https://github.com/SaifyXPRO)**

*If this node helps your workflow, please consider giving it a ⭐ on GitHub!*
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
```

## 📚 API Documentation

For complete API documentation, visit the [HeadlessX GitHub repository](https://github.com/SaifyXPRO/HeadlessX).

### Key Endpoints Reference
- `GET /health` - Health check
- `GET /status` - Server status  
- `GET /html` - HTML extraction (simple)
- `POST /html` - HTML extraction (advanced)
- `GET /content` - Text extraction (simple)
- `POST /content` - Text extraction (advanced)
- `GET /screenshot` - Screenshot capture
- `GET /pdf` - PDF generation
- `POST /render` - Full page render
- `POST /batch` - Batch processing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙋‍♂️ Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/SaifyXPRO/n8n-nodes-headlessx/issues)
- **HeadlessX Documentation**: [https://github.com/SaifyXPRO/HeadlessX](https://github.com/SaifyXPRO/HeadlessX)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## 🏷️ Version History

- **v1.0.0**: Initial release with full HeadlessX API integration
  - All GET/POST endpoints supported
  - Binary data handling for screenshots and PDFs
  - Comprehensive error handling
  - Batch processing capabilities

---

**Made with ❤️ for the n8n community**
