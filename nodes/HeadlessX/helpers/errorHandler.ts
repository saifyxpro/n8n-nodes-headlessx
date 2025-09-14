import { NodeOperationError, IExecuteFunctions } from 'n8n-workflow';

/**
 * Advanced error handling system for HeadlessX operations
 * Provides structured error reporting, retry logic, and detailed debugging information
 */

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: string;
  operation: string;
  url?: string;
  retryCount?: number;
  suggestion?: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  retryableErrorCodes: ErrorCode[];
}

export class HeadlessXError extends Error {
  public readonly details: ErrorDetails;

  constructor(details: Partial<ErrorDetails> & { code: ErrorCode; message: string; operation: string }) {
    super(details.message);
    this.name = 'HeadlessXError';
    this.details = {
      ...details,
      timestamp: new Date().toISOString(),
    } as ErrorDetails;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details,
    };
  }
}

export class ErrorHandler {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBackoff: true,
    retryableErrorCodes: [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.RATE_LIMIT_ERROR,
      ErrorCode.SYSTEM_ERROR
    ]
  };

  /**
   * Wraps function execution with advanced error handling and retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: {
      executeFunctions: IExecuteFunctions;
      operationName: string;
      url?: string;
      itemIndex: number;
    },
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<T> {
    const config = { ...this.DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: HeadlessXError | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const headlessXError = this.normalizeError(error, {
          operation: context.operationName,
          url: context.url,
          retryCount: attempt
        });

        lastError = headlessXError;

        // Check if error is retryable
        if (attempt < config.maxRetries && this.isRetryableError(headlessXError, config)) {
          const delay = this.calculateDelay(attempt, config);

          // Log retry attempt (using basic logging)
          // Note: retry attempt ${attempt + 1}/${config.maxRetries} for ${context.operationName}

          await this.sleep(delay);
          continue;
        }

        // Convert to n8n NodeOperationError for final throw
        throw new NodeOperationError(
          context.executeFunctions.getNode(),
          this.formatErrorMessage(headlessXError),
          { itemIndex: context.itemIndex }
        );
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new NodeOperationError(
      context.executeFunctions.getNode(),
      lastError ? this.formatErrorMessage(lastError) : 'Unknown error occurred',
      { itemIndex: context.itemIndex }
    );
  }

  /**
   * Normalizes different error types into HeadlessXError
   */
  static normalizeError(error: any, context: Partial<ErrorDetails>): HeadlessXError {
    if (error instanceof HeadlessXError) {
      return error;
    }

    let code = ErrorCode.SYSTEM_ERROR;
    let message = 'An unexpected error occurred';
    let suggestion = 'Please try again or contact support if the issue persists';

    if (error instanceof Error) {
      message = error.message;

      // Classify error based on message content
      if (this.isNetworkError(error)) {
        code = ErrorCode.NETWORK_ERROR;
        suggestion = 'Check your internet connection and ensure the target URL is accessible';
      } else if (this.isTimeoutError(error)) {
        code = ErrorCode.TIMEOUT_ERROR;
        suggestion = 'Increase the timeout value or check if the website is responding slowly';
      } else if (this.isRateLimitError(error)) {
        code = ErrorCode.RATE_LIMIT_ERROR;
        suggestion = 'Reduce request frequency or wait before retrying';
      } else if (this.isAuthenticationError(error)) {
        code = ErrorCode.AUTHENTICATION_ERROR;
        suggestion = 'Check your API credentials and ensure they are valid';
      } else if (this.isValidationError(error)) {
        code = ErrorCode.VALIDATION_ERROR;
        suggestion = 'Check your input parameters and ensure they meet the required format';
      }
    }

    return new HeadlessXError({
      code,
      message,
      originalError: error instanceof Error ? error : new Error(String(error)),
      suggestion,
      operation: context.operation || 'unknown',
      ...context
    });
  }

  /**
   * Checks if an error is retryable based on configuration
   */
  private static isRetryableError(error: HeadlessXError, config: RetryConfig): boolean {
    return config.retryableErrorCodes.includes(error.details.code);
  }

  /**
   * Calculates delay for retry with exponential backoff
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    if (!config.exponentialBackoff) {
      return config.baseDelay;
    }

    const delay = config.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Sleep utility for retry delays (simplified for n8n environment)
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      // Simple delay implementation
      const start = Date.now();
      while (Date.now() - start < ms) {
        // Busy wait (not ideal but works in n8n environment)
      }
      resolve();
    });
  }

  /**
   * Formats error message for n8n display
   */
  private static formatErrorMessage(error: HeadlessXError): string {
    const { code, message, suggestion, url, retryCount } = error.details;

    let formattedMessage = `[${code}] ${message}`;

    if (url) {
      formattedMessage += ` (URL: ${url})`;
    }

    if (retryCount && retryCount > 0) {
      formattedMessage += ` (Failed after ${retryCount} retries)`;
    }

    if (suggestion) {
      formattedMessage += `\n\nSuggestion: ${suggestion}`;
    }

    return formattedMessage;
  }

  // Error classification helpers
  private static isNetworkError(error: Error): boolean {
    const networkKeywords = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'network'];
    return networkKeywords.some(keyword => error.message.includes(keyword));
  }

  private static isTimeoutError(error: Error): boolean {
    const timeoutKeywords = ['timeout', 'ETIMEDOUT', 'Request timeout'];
    return timeoutKeywords.some(keyword => error.message.toLowerCase().includes(keyword.toLowerCase()));
  }

  private static isRateLimitError(error: Error): boolean {
    const rateLimitKeywords = ['rate limit', '429', 'too many requests'];
    return rateLimitKeywords.some(keyword => error.message.toLowerCase().includes(keyword.toLowerCase()));
  }

  private static isAuthenticationError(error: Error): boolean {
    const authKeywords = ['unauthorized', '401', '403', 'authentication', 'invalid credentials'];
    return authKeywords.some(keyword => error.message.toLowerCase().includes(keyword.toLowerCase()));
  }

  private static isValidationError(error: Error): boolean {
    const validationKeywords = ['invalid', 'validation', 'bad request', '400', 'malformed'];
    return validationKeywords.some(keyword => error.message.toLowerCase().includes(keyword.toLowerCase()));
  }
}

/**
 * Decorator for automatic error handling
 */
export function withErrorHandling(
  operationName: string,
  retryConfig?: Partial<RetryConfig>
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const executeFunctions = this as IExecuteFunctions;
      const itemIndex = args[0] || 0;

      return ErrorHandler.executeWithRetry(
        () => method.apply(this, args),
        {
          executeFunctions,
          operationName,
          itemIndex
        },
        retryConfig
      );
    };

    return descriptor;
  };
}
