import type {
  ClientConfig,
  ErrorResponse,
  RequestConfig,
  Response,
} from './types';
import { assembleHeaders, extractHeadersDict, toHeadersObject } from './utils';

// Parse error from response
async function parseErrorFromResponse(
  response: globalThis.Response,
): Promise<ErrorResponse> {
  try {
    const textContent = await response.text();
    const parsed = JSON.parse(textContent);
    return {
      message: parsed.message || 'Unknown error occurred',
      statusCode: response.status,
      name: parsed.name || 'application_error',
    };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        message:
          'Internal server error. We are unable to process your request right now, please try again later.',
        statusCode: response.status,
        name: 'application_error',
      };
    }

    if (err instanceof Error) {
      return {
        message: err.message,
        statusCode: response.status,
        name: 'application_error',
      };
    }

    return {
      message: response.statusText || 'Request failed',
      statusCode: response.status,
      name: 'application_error',
    };
  }
}

// Core request execution
async function executeRequest<T>(
  fullUrl: string,
  fetchConfig: RequestInit,
): Promise<Response<T>> {
  try {
    const response = await fetch(fullUrl, fetchConfig);

    if (!response.ok) {
      const error = await parseErrorFromResponse(response);
      return {
        data: null,
        error,
        headers: extractHeadersDict(response),
      };
    }

    const data = await response.json();
    return {
      data,
      error: null,
      headers: extractHeadersDict(response),
    };
  } catch {
    return {
      data: null,
      error: {
        name: 'application_error',
        statusCode: null,
        message: 'Unable to fetch data. The request could not be resolved.',
      },
      headers: null,
    };
  }
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config?: ClientConfig) {
    this.baseUrl = config?.url || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Merge custom headers from config
    if (config?.headers) {
      const customHeaders = assembleHeaders({}, config.headers);
      Object.assign(this.defaultHeaders, customHeaders);
    }
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  private buildRequestConfig(
    method: string,
    body?: unknown,
    options?: RequestConfig,
  ): RequestInit {
    const headers = assembleHeaders(this.defaultHeaders, options?.headers);

    const config: RequestInit = {
      method,
      headers: toHeadersObject(headers),
    };

    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    return config;
  }

  async get<T>(
    endpoint: string,
    options?: RequestConfig,
  ): Promise<Response<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = this.buildRequestConfig('GET', undefined, options);
    return executeRequest<T>(url, requestConfig);
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestConfig,
  ): Promise<Response<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = this.buildRequestConfig('POST', body, options);
    return executeRequest<T>(url, requestConfig);
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    options?: RequestConfig,
  ): Promise<Response<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = this.buildRequestConfig('PUT', body, options);
    return executeRequest<T>(url, requestConfig);
  }

  async patch<T>(
    endpoint: string,
    body: unknown,
    options?: RequestConfig,
  ): Promise<Response<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = this.buildRequestConfig('PATCH', body, options);
    return executeRequest<T>(url, requestConfig);
  }

  async delete<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestConfig,
  ): Promise<Response<T>> {
    const url = this.buildUrl(endpoint);
    const requestConfig = this.buildRequestConfig('DELETE', body, options);
    return executeRequest<T>(url, requestConfig);
  }
}

// Re-export types
export type {
  ClientConfig,
  ErrorResponse,
  RequestConfig,
  Response,
} from './types';
