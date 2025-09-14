# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **📊 Smart Operation Grouping**: Operations organized into logical categories:
  - Content Extraction (📄 HTML, 📝 Content)
  - Visual Capture (📸 Screenshot, 📋 PDF) 
  - Advanced Processing (🎭 Render, 🔄 Batch)
- **🎯 Smart Defaults**: Improved default operation selection (htmlGet as most common)
- **✅ Enhanced Input Validation**: Real-time URL validation with helpful error messages
- **🖥️ Device Emulation Presets**: Pre-configured device options for screenshots (Desktop, Mobile, Tablet)
- **🎛️ Advanced Screenshot Options**: Quality controls, format selection (PNG/JPEG/WebP), custom viewport
- **📑 Batch Processing Enhancement**: JSON editor for batch URLs with improved validation
- **🔄 Improved Error Handling**: Better error messages and recovery options

### Enhanced
- **Screenshot Operation**: Added comprehensive device emulation, format options, and quality controls
- **Batch Operation**: Enhanced with JSON validation, concurrency controls, and error handling
- **All POST Operations**: Added advanced configuration collections for better user control
- **Operation Selection**: Visual categories with descriptive names and detailed tooltips

### Technical Improvements
- **📋 Better Property Organization**: Alphabetical ordering for improved maintainability
- **🔧 Enhanced TypeScript Types**: Improved type safety and IntelliSense support
- **⚡ Performance Optimizations**: Better request handling and response processing
- **🛡️ Robust Validation**: Enhanced input validation across all operations

## [1.0.9] - 2024-12-XX

### Fixed
- **CRITICAL**: Fixed node execution issues with proper n8n output formatting
- Implemented proper `prepareOutputData()` method for n8n compatibility  
- Fixed `pairedItem` structure using `{ item: itemIndex }` format
- Enhanced error handling with operation context and timestamps
- Improved credential test to use `/api/health` endpoint (more reliable)
- Fixed variable scoping issues in execute function

### Changed
- Updated execute method to follow n8n community standards
- Enhanced error reporting with operation details
- Improved code structure for better maintainability

## [1.0.8] - 2024-12-XX

### Fixed
- Simplified URL validation to prevent false "Invalid URL" errors
- Enhanced credential test success message with proper green display
- Improved error handling for edge cases

### Changed
- Updated package version for bug fixes

## [1.0.7] - 2024-12-XX

### Fixed
- Fixed output formatting for HTML and content operations
- Restructured response objects to include proper metadata
- Improved JSON output structure for n8n workflows

### Added
- Comprehensive API integration testing
- Enhanced error handling and validation

## [1.0.6] - 2024-12-XX

### Added
- Initial release of HeadlessX n8n community node
- Support for all 10 HeadlessX API endpoints
- Multiple authentication methods (X-Token, Bearer, Query parameter)
- Binary data handling for screenshots and PDFs
- Comprehensive documentation and examples

### Features
- Health status monitoring
- HTML content extraction (GET/POST)
- Clean text content extraction (GET/POST)
- Screenshot capture with format options
- PDF generation with custom settings
- Page rendering and processing
- Batch operations support
