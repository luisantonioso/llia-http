// Type definitions for the API client

export interface RequestConfig {
  headers?: HeadersInit;
}

export type Response<T> = (
  | { data: T; error: null }
  | { data: null; error: ErrorResponse }
) & {
  headers: Record<string, string> | null;
};

export interface ErrorResponse {
  message: string;
  statusCode: number | null;
  name: string;
}

export interface ClientConfig {
  url?: string;
  headers?: HeadersInit;
}
