/**
 * Comprehensive input validation system for HeadlessX operations
 * Provides URL validation, parameter sanitization, and security checks
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedValue?: any;
}

export interface URLValidationOptions {
  allowedProtocols?: string[];
  allowedDomains?: string[];
  blockedDomains?: string[];
  allowLocalhost?: boolean;
  allowPrivateIPs?: boolean;
  maxLength?: number;
}

export interface HeaderValidationOptions {
  allowedHeaders?: string[];
  blockedHeaders?: string[];
  maxHeaderLength?: number;
  sanitizeValues?: boolean;
}

export class ValidationHelper {
  private static readonly DEFAULT_URL_OPTIONS: URLValidationOptions = {
    allowedProtocols: ['http:', 'https:'],
    blockedDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
    allowLocalhost: false,
    allowPrivateIPs: false,
    maxLength: 2048
  };

  private static readonly DEFAULT_HEADER_OPTIONS: HeaderValidationOptions = {
    blockedHeaders: ['authorization', 'cookie', 'set-cookie'],
    maxHeaderLength: 1024,
    sanitizeValues: true
  };

  private static readonly PRIVATE_IP_RANGES = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fe80:/i,
    /^fc00:/i,
    /^fd00:/i
  ];

  /**
   * Simple URL parser for validation (n8n compatible)
   */
  private static parseURL(url: string): { protocol: string; hostname: string; port?: string } | null {
    try {
      const match = url.match(/^(https?):\/\/([^:/]+)(?::(\d+))?/);
      if (!match) return null;

      return {
        protocol: match[1] + ':',
        hostname: match[2].toLowerCase(),
        port: match[3]
      };
    } catch {
      return null;
    }
  }

  /**
   * Validates and sanitizes URLs to prevent SSRF and other security issues
   */
  static validateURL(url: string, options: URLValidationOptions = {}): ValidationResult {
    const opts = { ...this.DEFAULT_URL_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic length check
    if (url.length > opts.maxLength!) {
      errors.push(`URL exceeds maximum length of ${opts.maxLength} characters`);
    }

    // Basic format validation
    if (!url || typeof url !== 'string') {
      errors.push('URL must be a non-empty string');
      return { isValid: false, errors, warnings };
    }

    let parsedURL: { protocol: string; hostname: string; port?: string } | null;
    try {
      parsedURL = this.parseURL(url);
      if (!parsedURL) {
        errors.push('Invalid URL format');
        return { isValid: false, errors, warnings };
      }
    } catch (error) {
      errors.push('Invalid URL format');
      return { isValid: false, errors, warnings };
    }

    // Protocol validation
    if (!opts.allowedProtocols!.includes(parsedURL.protocol)) {
      errors.push(`Protocol '${parsedURL.protocol}' is not allowed. Allowed protocols: ${opts.allowedProtocols!.join(', ')}`);
    }

    // Domain validation
    const hostname = parsedURL.hostname.toLowerCase();

    // Check blocked domains
    if (opts.blockedDomains && opts.blockedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
      errors.push(`Domain '${hostname}' is blocked`);
    }

    // Check allowed domains
    if (opts.allowedDomains && !opts.allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
      errors.push(`Domain '${hostname}' is not in the allowed domains list`);
    }

    // Localhost check
    if (!opts.allowLocalhost && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1')) {
      errors.push('Localhost URLs are not allowed');
    }

    // Private IP check
    if (!opts.allowPrivateIPs && this.isPrivateIP(hostname)) {
      errors.push('Private IP addresses are not allowed');
    }

    // Port validation
    if (parsedURL.port) {
      const port = parseInt(parsedURL.port, 10);
      if (port < 1 || port > 65535) {
        errors.push('Invalid port number');
      }
      if (port < 1024 && !opts.allowLocalhost) {
        warnings.push('Using privileged port (< 1024), ensure this is intended');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: url // Return original URL since we can't reconstruct
    };
  }

  /**
   * Validates and sanitizes HTTP headers
   */
  static validateHeaders(headers: Record<string, string>, options: HeaderValidationOptions = {}): ValidationResult {
    const opts = { ...this.DEFAULT_HEADER_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedHeaders: Record<string, string> = {};

    if (!headers || typeof headers !== 'object') {
      return {
        isValid: true,
        errors,
        warnings,
        sanitizedValue: {}
      };
    }

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();

      // Check blocked headers
      if (opts.blockedHeaders && opts.blockedHeaders.includes(lowerKey)) {
        warnings.push(`Header '${key}' is blocked and will be ignored for security reasons`);
        continue;
      }

      // Check allowed headers
      if (opts.allowedHeaders && !opts.allowedHeaders.includes(lowerKey)) {
        warnings.push(`Header '${key}' is not in the allowed headers list and will be ignored`);
        continue;
      }

      // Validate header name
      if (!this.isValidHeaderName(key)) {
        errors.push(`Invalid header name: '${key}'`);
        continue;
      }

      // Validate header value
      const validationResult = this.validateHeaderValue(value, opts.maxHeaderLength!);
      if (!validationResult.isValid) {
        errors.push(`Invalid header value for '${key}': ${validationResult.errors.join(', ')}`);
        continue;
      }

      // Sanitize value if requested
      const sanitizedValue = opts.sanitizeValues ? this.sanitizeHeaderValue(value) : value;
      sanitizedHeaders[key] = sanitizedValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: sanitizedHeaders
    };
  }

  /**
   * Validates timeout values
   */
  static validateTimeout(timeout: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof timeout !== 'number' || isNaN(timeout)) {
      errors.push('Timeout must be a valid number');
    } else if (timeout < 0) {
      errors.push('Timeout cannot be negative');
    } else if (timeout === 0) {
      warnings.push('Timeout of 0 means no timeout, which may cause operations to hang indefinitely');
    } else if (timeout > 300000) { // 5 minutes
      warnings.push('Timeout exceeds 5 minutes, which may cause workflow timeouts');
    } else if (timeout < 1000) {
      warnings.push('Timeout less than 1 second may be too short for most operations');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: Math.max(0, Math.floor(timeout))
    };
  }

  /**
   * Validates wait conditions
   */
  static validateWaitCondition(condition: string): ValidationResult {
    const validConditions = ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'];
    const errors: string[] = [];

    if (!condition || typeof condition !== 'string') {
      errors.push('Wait condition must be a non-empty string');
    } else if (!validConditions.includes(condition)) {
      errors.push(`Invalid wait condition '${condition}'. Valid options: ${validConditions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
      sanitizedValue: condition
    };
  }

  /**
   * Validates user agent strings
   */
  static validateUserAgent(userAgent: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!userAgent || typeof userAgent !== 'string') {
      errors.push('User agent must be a non-empty string');
    } else {
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /bot|crawler|spider/i,
        /curl|wget|postman/i,
        /python|java|.net/i
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        warnings.push('User agent appears to be from an automated tool, which may be blocked by some websites');
      }

      if (userAgent.length > 512) {
        errors.push('User agent string is too long (max 512 characters)');
      }

      if (userAgent.length < 10) {
        warnings.push('User agent string is very short and may be suspicious to websites');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: userAgent?.trim()
    };
  }

  /**
   * Validates viewport dimensions
   */
  static validateViewport(viewport: { width?: number; height?: number }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!viewport || typeof viewport !== 'object') {
      errors.push('Viewport must be an object with width and height properties');
      return { isValid: false, errors, warnings };
    }

    const { width, height } = viewport;

    // Validate width
    if (width !== undefined) {
      if (typeof width !== 'number' || isNaN(width)) {
        errors.push('Viewport width must be a valid number');
      } else if (width < 100) {
        errors.push('Viewport width must be at least 100 pixels');
      } else if (width > 7680) { // 8K width
        warnings.push('Viewport width is very large, which may cause performance issues');
      }
    }

    // Validate height
    if (height !== undefined) {
      if (typeof height !== 'number' || isNaN(height)) {
        errors.push('Viewport height must be a valid number');
      } else if (height < 100) {
        errors.push('Viewport height must be at least 100 pixels');
      } else if (height > 4320) { // 8K height
        warnings.push('Viewport height is very large, which may cause performance issues');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: {
        width: width ? Math.floor(width) : undefined,
        height: height ? Math.floor(height) : undefined
      }
    };
  }

  /**
   * Comprehensive parameter validation for all operations
   */
  static validateOperationParameters(operation: string, params: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedParams: Record<string, any> = {};

    // Common validations for all operations
    if (params.url) {
      const urlValidation = this.validateURL(params.url);
      if (!urlValidation.isValid) {
        errors.push(...urlValidation.errors);
      }
      warnings.push(...urlValidation.warnings);
      sanitizedParams.url = urlValidation.sanitizedValue;
    }

    if (params.headers) {
      const headerValidation = this.validateHeaders(params.headers);
      if (!headerValidation.isValid) {
        errors.push(...headerValidation.errors);
      }
      warnings.push(...headerValidation.warnings);
      sanitizedParams.headers = headerValidation.sanitizedValue;
    }

    if (params.timeout !== undefined) {
      const timeoutValidation = this.validateTimeout(params.timeout);
      if (!timeoutValidation.isValid) {
        errors.push(...timeoutValidation.errors);
      }
      warnings.push(...timeoutValidation.warnings);
      sanitizedParams.timeout = timeoutValidation.sanitizedValue;
    }

    if (params.waitUntil) {
      const waitValidation = this.validateWaitCondition(params.waitUntil);
      if (!waitValidation.isValid) {
        errors.push(...waitValidation.errors);
      }
      sanitizedParams.waitUntil = waitValidation.sanitizedValue;
    }

    if (params.userAgent) {
      const uaValidation = this.validateUserAgent(params.userAgent);
      if (!uaValidation.isValid) {
        errors.push(...uaValidation.errors);
      }
      warnings.push(...uaValidation.warnings);
      sanitizedParams.userAgent = uaValidation.sanitizedValue;
    }

    if (params.viewport) {
      const viewportValidation = this.validateViewport(params.viewport);
      if (!viewportValidation.isValid) {
        errors.push(...viewportValidation.errors);
      }
      warnings.push(...viewportValidation.warnings);
      sanitizedParams.viewport = viewportValidation.sanitizedValue;
    }

    // Operation-specific validations
    switch (operation) {
      case 'pdf':
        this.validatePDFParams(params, errors, warnings, sanitizedParams);
        break;
      case 'screenshot':
        this.validateScreenshotParams(params, errors, warnings, sanitizedParams);
        break;
      case 'batch':
        this.validateBatchParams(params, errors, warnings, sanitizedParams);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: sanitizedParams
    };
  }

  // Helper methods
  private static isPrivateIP(hostname: string): boolean {
    return this.PRIVATE_IP_RANGES.some(range => range.test(hostname));
  }

  private static isValidHeaderName(name: string): boolean {
    // RFC 7230 compliant header name validation
    return /^[!#$%&'*+\-.0-9A-Z^_`a-z|~]+$/.test(name);
  }

  private static validateHeaderValue(value: string, maxLength: number): ValidationResult {
    const errors: string[] = [];

    if (value.length > maxLength) {
      errors.push(`Header value exceeds maximum length of ${maxLength} characters`);
    }

    // Check for control characters (except tab)
    if (/[\x00-\x08\x0a-\x1f\x7f]/.test(value)) {
      errors.push('Header value contains invalid control characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private static sanitizeHeaderValue(value: string): string {
    // Remove potential security threats
    return value
      .replace(/[\x00-\x08\x0a-\x1f\x7f]/g, '') // Remove control characters
      .replace(/\r?\n\s*/g, ' ') // Normalize line breaks
      .trim();
  }

  private static validatePDFParams(params: any, errors: string[], warnings: string[], sanitized: any): void {
    if (params.format && !['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'Letter', 'Legal', 'Tabloid', 'Ledger'].includes(params.format)) {
      errors.push('Invalid PDF format specified');
    }

    if (params.quality !== undefined) {
      const quality = Number(params.quality);
      if (isNaN(quality) || quality < 0 || quality > 100) {
        errors.push('PDF quality must be a number between 0 and 100');
      } else {
        sanitized.quality = Math.round(quality);
      }
    }
  }

  private static validateScreenshotParams(params: any, errors: string[], warnings: string[], sanitized: any): void {
    if (params.type && !['png', 'jpeg', 'webp'].includes(params.type)) {
      errors.push('Invalid screenshot type. Supported types: png, jpeg, webp');
    }

    if (params.quality !== undefined && params.type === 'jpeg') {
      const quality = Number(params.quality);
      if (isNaN(quality) || quality < 0 || quality > 100) {
        errors.push('JPEG quality must be a number between 0 and 100');
      } else {
        sanitized.quality = Math.round(quality);
      }
    }
  }

  private static validateBatchParams(params: any, errors: string[], warnings: string[], sanitized: any): void {
    if (params.urls && Array.isArray(params.urls)) {
      if (params.urls.length === 0) {
        errors.push('Batch operation requires at least one URL');
      } else if (params.urls.length > 100) {
        warnings.push('Large batch size may cause performance issues and rate limiting');
      }

      // Validate each URL in the batch
      const validatedUrls = [];
      for (const url of params.urls) {
        const urlValidation = this.validateURL(url);
        if (urlValidation.isValid) {
          validatedUrls.push(urlValidation.sanitizedValue);
        } else {
          errors.push(`Invalid URL in batch: ${url} - ${urlValidation.errors.join(', ')}`);
        }
      }
      sanitized.urls = validatedUrls;
    }
  }
}
