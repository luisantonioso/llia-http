# @llia/http

Simple and type-safe HTTP client library for making HTTP requests with TypeScript.

## Installation

Copy the files from the `src` folder to your project and import directly:

### File Structure

The `src` folder contains:
- `index.ts` - Main file with the `HttpClient` class
- `types.ts` - TypeScript type definitions
- `utils.ts` - Utility functions

## Basic Usage

```typescript
import { HttpClient } from './path/to/src/index.ts';
// or
import { HttpClient } from './src/index.ts';

// Create client instance
const client = new HttpClient({
  url: 'https://api.example.com',
});

// GET request
const result = await client.get<{ id: number; name: string }>('/users/1');

if (result.error) {
  console.error('Error:', result.error.message);
} else {
  console.log('Data:', result.data);
}
```

## Configuration

### Base URL

The base URL is optional. If not provided, you can use full endpoints:

```typescript
// With base URL
const client = new HttpClient({
  url: 'https://api.example.com',
});

// Without base URL (use full endpoints)
const client = new HttpClient();
const result = await client.get('https://api.example.com/users/1');
```

### Global Headers

Headers defined in the constructor are sent in all requests. The `Content-Type: application/json` header is automatically added by default:

```typescript
const client = new HttpClient({
  url: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer token123',
    'X-API-Key': 'my-api-key',
  },
});
```

## HTTP Methods

### GET

```typescript
const result = await client.get<User>('/users/1');

// With custom headers
const result = await client.get<User>('/users/1', {
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### POST

```typescript
const result = await client.post<CreatedUser>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Without body
const result = await client.post<Response>('/endpoint');
```

### PUT

The body is required for PUT requests:

```typescript
const result = await client.put<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
});

// With custom headers
const result = await client.put<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
}, {
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### PATCH

The body is required for PATCH requests:

```typescript
const result = await client.patch<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
});

// With custom headers
const result = await client.patch<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
}, {
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### DELETE

```typescript
const result = await client.delete<void>('/users/1');

// With body
const result = await client.delete<Response>('/users/1', {
  reason: 'Deleted by user',
});
```

## Response Handling

All requests return a `Response<T>` object with the following structure:

```typescript
type Response<T> = 
  | { data: T; error: null }
  | { data: null; error: ErrorResponse };
```

### Success Example

```typescript
const result = await client.get<User>('/users/1');

if (result.error === null) {
  console.log(result.data); // User
} else {
  console.error(result.error.message);
  console.error(result.error.statusCode);
  console.error(result.error.name);
}
```

### Error Example

```typescript
const result = await client.get<User>('/users/999');

if (result.error) {
  console.error('Message:', result.error.message);
  console.error('Status:', result.error.statusCode);
  console.error('Type:', result.error.name);
} else {
  console.log(result.data);
}
```

### Network Errors

When the request cannot be resolved (network error, CORS, etc.), the `statusCode` will be `null`:

```typescript
const result = await client.get<User>('/users/1');

if (result.error) {
  if (result.error.statusCode === null) {
    // Network error - request could not be resolved
    console.error('Network error:', result.error.message);
  } else {
    // HTTP error - request was made but returned an error
    console.error('HTTP error:', result.error.statusCode, result.error.message);
  }
}
```

## Headers per Request

Headers passed in a specific request override the global headers:

```typescript
const client = new HttpClient({
  url: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer default-token',
  },
});

// This request will use 'Bearer custom-token' instead of 'Bearer default-token'
const result = await client.get('/users', {
  headers: {
    Authorization: 'Bearer custom-token',
  },
});
```

## Types

```typescript
import type { Response, ErrorResponse, ClientConfig, RequestConfig } from './path/to/src/index.ts';
// or
import type { Response, ErrorResponse, ClientConfig, RequestConfig } from './src/index.ts';

// Response<T> - Return type for all requests
type Response<T> = 
  | { data: T; error: null }
  | { data: null; error: ErrorResponse };

// ErrorResponse - Error structure
interface ErrorResponse {
  message: string;
  statusCode: number | null;
  name: string;
}

// ClientConfig - Constructor configuration
interface ClientConfig {
  url?: string; // Base URL (optional)
  headers?: HeadersInit; // Global headers (Headers, Record, or Array)
}

// RequestConfig - Per-request configuration
interface RequestConfig {
  headers?: HeadersInit; // Request-specific headers
}
```

## Scripts

```bash
# Run tests
bun test

# Build
bun run build

# Lint
bun run lint

# Lint and fix
bun run lint:fix
```
