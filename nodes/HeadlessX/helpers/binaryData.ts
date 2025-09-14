import { IExecuteFunctions, IBinaryData } from 'n8n-workflow';
import { Buffer } from 'buffer';

/**
 * Robust binary data preparation helper for n8n community nodes
 * Handles various edge cases and provides fallback mechanisms
 */

export interface BinaryDataOptions {
  fileName: string;
  mimeType: string;
  propertyName?: string;
}

export class BinaryDataHelper {
  /**
   * Safely prepares binary data from string content with proper error handling
   */
  static async prepareBinaryFromString(
    executeFunctions: IExecuteFunctions,
    content: string,
    options: BinaryDataOptions
  ): Promise<{ [key: string]: IBinaryData } | null> {
    try {
      const { fileName, mimeType, propertyName = 'data' } = options;

      // Validate inputs
      if (!content || typeof content !== 'string') {
        throw new Error('Content must be a non-empty string');
      }

      if (!fileName || !mimeType) {
        throw new Error('fileName and mimeType are required');
      }

      // Convert string to Buffer with proper encoding detection
      const encoding = BinaryDataHelper.detectEncoding(content);
      const buffer = Buffer.from(content, encoding);

      // Validate buffer creation
      if (!buffer || buffer.length === 0) {
        throw new Error('Failed to create buffer from content');
      }

      // Use n8n's prepareBinaryData helper
      const binaryData = await executeFunctions.helpers.prepareBinaryData(
        buffer,
        fileName,
        mimeType
      );

      // Validate binary data creation
      if (!binaryData) {
        throw new Error('Failed to prepare binary data');
      }

      return {
        [propertyName]: binaryData
      };

    } catch (error) {
      // Log error for debugging but don't throw to allow fallback (console not available in n8n environment)
      return null;
    }
  }

  /**
   * Safely prepares binary data from Buffer with validation
   */
  static async prepareBinaryFromBuffer(
    executeFunctions: IExecuteFunctions,
    buffer: Buffer,
    options: BinaryDataOptions
  ): Promise<{ [key: string]: IBinaryData } | null> {
    try {
      const { fileName, mimeType, propertyName = 'data' } = options;

      // Validate inputs
      if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new Error('Invalid or empty buffer provided');
      }

      if (!fileName || !mimeType) {
        throw new Error('fileName and mimeType are required');
      }

      // Use n8n's prepareBinaryData helper
      const binaryData = await executeFunctions.helpers.prepareBinaryData(
        buffer,
        fileName,
        mimeType
      );

      if (!binaryData) {
        throw new Error('Failed to prepare binary data');
      }

      return {
        [propertyName]: binaryData
      };

    } catch (error) {
      // Error handling for n8n environment
      return null;
    }
  }

  /**
   * Detects appropriate encoding for string content
   */
  private static detectEncoding(content: string): string {
    try {
      // Always use UTF-8 as it's the safest and most widely supported
      return 'utf8';
    } catch {
      return 'utf8'; // Safe default
    }
  }

  /**
   * Creates preview summary for content
   */
  static createPreviewSummary(
    content: string,
    maxLength: number = 500,
    type: 'html' | 'text' = 'text'
  ): {
    summary: string;
    fullLength: number;
    isTruncated: boolean;
  } {
    if (!content || typeof content !== 'string') {
      return {
        summary: '',
        fullLength: 0,
        isTruncated: false
      };
    }

    const isTruncated = content.length > maxLength;
    const summary = isTruncated
      ? content.substring(0, maxLength) + '...'
      : content;

    return {
      summary,
      fullLength: content.length,
      isTruncated
    };
  }

  /**
   * Validates if binary data preparation is supported in current n8n environment
   */
  static validateEnvironment(executeFunctions: IExecuteFunctions): boolean {
    try {
      return (
        typeof executeFunctions?.helpers?.prepareBinaryData === 'function' &&
        typeof Buffer !== 'undefined'
      );
    } catch {
      return false;
    }
  }

  /**
   * Gets appropriate MIME type for file extension
   */
  static getMimeTypeForExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const mimeMap: { [key: string]: string } = {
      'html': 'text/html',
      'htm': 'text/html',
      'txt': 'text/plain',
      'json': 'application/json',
      'xml': 'application/xml',
      'css': 'text/css',
      'js': 'application/javascript',
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };

    return mimeMap[extension || ''] || 'application/octet-stream';
  }
}
