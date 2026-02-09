# HeadlessX n8n Node Examples

Example workflows for the HeadlessX n8n community node (v2.0).

## 📊 Available Operations

| Operation    | Description                    | Endpoint                       |
| ------------ | ------------------------------ | ------------------------------ |
| `html`       | Extract raw HTML               | `POST /api/website/html`       |
| `htmlJs`     | Extract HTML with JS rendering | `POST /api/website/html-js`    |
| `content`    | Extract Markdown content       | `POST /api/website/content`    |
| `screenshot` | Capture screenshots            | `POST /api/website/screenshot` |
| `googleSerp` | Google SERP scraping           | `POST /api/google-serp/search` |

## 📄 HTML Extraction

```json
{
  "operation": "html",
  "url": "https://example.com",
  "htmlOptions": {
    "timeout": 30000,
    "waitUntil": "networkidle2"
  }
}
```

## 📄 HTML with JavaScript Rendering

For SPAs and dynamic content:

```json
{
  "operation": "htmlJs",
  "url": "https://react-app.example.com",
  "htmlJsOptions": {
    "timeout": 60000,
    "extraWaitTime": 3000,
    "waitUntil": "networkidle0"
  }
}
```

## 📝 Content Extraction

Extract clean Markdown:

```json
{
  "operation": "content",
  "url": "https://blog.example.com/article",
  "contentOptions": {
    "timeout": 30000
  }
}
```

## 📸 Screenshot Capture

```json
{
  "operation": "screenshot",
  "url": "https://example.com",
  "screenshotOptions": {
    "fullPage": true,
    "format": "png",
    "quality": 90
  }
}
```

## 🔍 Google SERP Search

```json
{
  "operation": "googleSerp",
  "query": "web scraping tools",
  "serpOptions": {
    "num": 20,
    "hl": "en",
    "gl": "us",
    "safe": "off"
  }
}
```

## 🔄 Workflow Examples

### SEO Monitoring Workflow

1. **Schedule Trigger** - Daily at 9 AM
2. **HeadlessX: Google SERP** - Track keyword rankings
3. **Compare** - Check against previous results
4. **Slack** - Alert on ranking changes

### Content Aggregation Workflow

1. **RSS Trigger** - New article detected
2. **HeadlessX: Content** - Extract article text
3. **OpenAI** - Summarize content
4. **Notion** - Store summary

### Visual Testing Workflow

1. **Webhook** - Deployment notification
2. **HeadlessX: Screenshot** - Capture pages
3. **Compare Images** - Detect visual changes
4. **Email** - Send regression report

## 🤝 Contributing Examples

1. Create example workflow JSON
2. Add documentation explaining use case
3. Test the workflow
4. Submit pull request

## 📚 Support

- [Main Documentation](../README.md)
- [HeadlessX API](https://github.com/SaifyXPRO/HeadlessX)
- [n8n Community](https://community.n8n.io/)
