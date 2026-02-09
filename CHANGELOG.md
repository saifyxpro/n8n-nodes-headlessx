# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-29

### ⚠️ BREAKING CHANGES

This major release aligns the n8n node with HeadlessX v2 API. **Existing workflows will need to be updated.**

### Changed
- **🔄 API Paths Updated**: All endpoints now use v2 paths
  - `/api/html` → `/api/website/html`
  - `/api/content` → `/api/website/content`
  - `/api/screenshot` → `/api/website/screenshot`
- **📝 Simplified Operations**: Merged GET/POST duplicates into single POST operations
  - `htmlGet` + `htmlPost` → `html` (POST)
  - `contentGet` + `contentPost` → `content` (POST)

### Added
- **🔍 Google SERP Operation**: New `googleSerp` operation for `/api/google-serp/search`
  - Search query with localization options
  - Language and country filters
  - Safe search settings
- **📄 HTML-JS Operation**: New `htmlJs` operation for `/api/website/html-js`
  - Full JavaScript rendering for SPAs
  - Better support for dynamic content

### Removed
- **📋 PDF Operation**: Removed (not available in v2 API)
- **🎭 Render Operation**: Removed (not available in v2 API)
- **🔄 Batch Operation**: Removed (not available in v2 API)
- **🔀 GET Operations**: Merged into POST-only operations

### Technical
- **🦊 Camoufox Support**: Updated for HeadlessX v2's Camoufox engine
- **🧹 Code Cleanup**: Removed unused imports and dead code
- **✅ TypeScript**: Clean compilation with no errors

---

## [1.2.2] - 2025-09-14

### Changed
- **📦 Package Version**: Incremented version to 1.2.2 for package maintenance

---

## [1.2.1] - 2025-09-14

### Changed
- **📦 Package Version**: Incremented version to 1.2.1 for package maintenance
- **📚 Documentation**: Updated all version references in README.md from v1.2.0 to v1.2.1
- **✅ Verification Ready**: Package prepared for n8n community node verification submission

### Technical
- **🔧 Build System**: Verified npm build continues to work correctly
- **🧪 Quality Assurance**: All TypeScript linting passes (except expected package.json parser warning)
- **🛠️ Maintenance**: No functional changes, purely versioning and documentation updates

## [1.2.0] - 2025-09-14

### Fixed
- **🚨 CRITICAL PRODUCTION FIX**: Resolved "stream.on is not a function" error in preview functionality
- **🔧 Binary Data Handling**: Fixed `prepareBinaryData()` calls to use `Buffer.from()` instead of raw strings
- **🛡️ Enhanced Error Handling**: Added comprehensive try-catch blocks with JSON fallbacks for preview operations
- **📄 HTML Preview Fix**: Fixed both GET and POST HTML extraction preview functionality
- **📝 Content Preview Fix**: Fixed both GET and POST content extraction preview functionality

### Added
- **🔧 BinaryDataHelper Utility**: New comprehensive utility class for robust binary data operations
- **✅ Environment Validation**: Added n8n runtime compatibility checks
- **🛡️ Graceful Degradation**: Preview operations now fallback to JSON output if binary preparation fails
- **📊 Production Stability**: Enhanced error handling ensures node continues working even if preview fails

### Technical Improvements
- **🔄 Buffer-Based Operations**: All binary data operations now use proper Buffer objects
- **🧪 TypeScript Validation**: Clean compilation with enhanced type safety
- **⚡ Production Ready**: Tested and validated for n8n production environments
- **🔗 Future-Proof Architecture**: BinaryDataHelper provides foundation for future binary operations

## [1.1.3] - 2025-09-13

### Added
- **🎨 Enhanced User Experience**: Complete UX overhaul with visual operation categories
- **📱 Visual Operation Icons**: All operations now feature intuitive emoji icons for better recognition
- **🔧 Advanced POST Options**: Comprehensive advanced options for all POST operations
- **📊 Smart Operation Grouping**: Operations organized into logical categories
- **🎯 Smart Defaults**: Improved default operation selection
- **✅ Enhanced Input Validation**: Real-time URL validation with helpful error messages
- **🖥️ Device Emulation Presets**: Pre-configured device options for screenshots
- **🎛️ Advanced Screenshot Options**: Quality controls, format selection (PNG/JPEG/WebP), custom viewport

## [1.0.9] - 2024-12-XX

### Fixed
- **CRITICAL**: Fixed node execution issues with proper n8n output formatting
- Implemented proper `prepareOutputData()` method for n8n compatibility  
- Fixed `pairedItem` structure using `{ item: itemIndex }` format
- Enhanced error handling with operation context and timestamps
- Improved credential test to use `/api/health` endpoint (more reliable)
- Fixed variable scoping issues in execute function

## [1.0.6] - 2024-12-XX

### Added
- Initial release of HeadlessX n8n community node
- Support for HeadlessX API endpoints
- Multiple authentication methods (X-Token, Bearer, Query parameter)
- Binary data handling for screenshots
- Comprehensive documentation and examples
