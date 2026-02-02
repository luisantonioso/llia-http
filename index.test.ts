import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { HttpClient } from './src/index';
import type { Response } from './src/types';

// Servidor HTTP mock para simular requisições
let mockServer: ReturnType<typeof Bun.serve> | null = null;
let serverPort = 0;

beforeAll(() => {
  mockServer = Bun.serve({
    port: 0, // Porta aleatória
    async fetch(req) {
      const url = new URL(req.url);
      const method = req.method;
      const path = url.pathname;

      // Simular diferentes endpoints e comportamentos
      if (path === '/success') {
        return new Response(
          JSON.stringify({ message: 'Success', data: { id: 1 } }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      if (path === '/error') {
        return new Response(
          JSON.stringify({
            name: 'api_failure',
            message: 'Something went wrong',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      if (path === '/server-error') {
        return new Response('Internal Server Error', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      if (path === '/echo') {
        const body = await req.text();
        return new Response(
          JSON.stringify({
            method,
            body: body ? JSON.parse(body) : null,
            headers: Object.fromEntries(req.headers.entries()),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      if (path === '/auth-check') {
        const authHeader = req.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
          return new Response(
            JSON.stringify({ authenticated: true, token: authHeader.slice(7) }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
        return new Response(JSON.stringify({ authenticated: false }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not Found', { status: 404 });
    },
  });

  serverPort = mockServer.port || 0;
});

afterAll(() => {
  if (mockServer) {
    mockServer.stop();
  }
});

describe('HttpClient', () => {
  it('deve criar um cliente', () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    expect(client).toBeDefined();
    expect(typeof client.get).toBe('function');
    expect(typeof client.post).toBe('function');
    expect(typeof client.put).toBe('function');
    expect(typeof client.patch).toBe('function');
    expect(typeof client.delete).toBe('function');
  });

  it('deve criar cliente com headers no construtor', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
      headers: {
        Authorization: 'Bearer constructor-token',
        'X-Api-Key': 'my-api-key',
      },
    });

    const result = await client.get<{ authenticated: boolean; token?: string }>(
      '/auth-check',
    );

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.authenticated).toBe(true);
      expect(result.data.token).toBe('constructor-token');
    }
  });
});

describe('GET requests', () => {
  it('deve fazer requisição GET bem-sucedida', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const result = await client.get<{ message: string; data: { id: number } }>(
      '/success',
    );

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    if (result.data) {
      expect(result.data.message).toBe('Success');
      expect(result.data.data.id).toBe(1);
    }
    expect(result.headers).toBeDefined();
  });

  it('deve retornar erro quando requisição falha', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const result = await client.get('/error');

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    if (result.error) {
      expect(result.error.message).toBe('Something went wrong');
      expect(result.error.statusCode).toBe(400);
      expect(result.error.name).toBe('api_failure');
    }
  });

  it('deve incluir headers customizados na requisição', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const result = await client.get<{ authenticated: boolean; token?: string }>(
      '/auth-check',
      {
        headers: {
          Authorization: 'Bearer my-secret-token',
        },
      },
    );

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.authenticated).toBe(true);
      expect(result.data.token).toBe('my-secret-token');
    }
  });
});

describe('POST requests', () => {
  it('deve fazer requisição POST com payload', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const payload = { name: 'Test', value: 123 };
    const result = await client.post<{
      method: string;
      body: unknown;
      headers: Record<string, string>;
    }>('/echo', payload);

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.method).toBe('POST');
      expect(result.data.body).toEqual(payload);
    }
  });

  it('deve fazer POST sem payload', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const result = await client.post<{
      method: string;
      body: unknown;
    }>('/echo');

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.method).toBe('POST');
      expect(result.data.body).toBeNull();
    }
  });
});

describe('PUT requests', () => {
  it('deve fazer requisição PUT com payload', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const payload = { id: 1, name: 'Updated' };
    const result = await client.put<{
      method: string;
      body: unknown;
    }>('/echo', payload);

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.method).toBe('PUT');
      expect(result.data.body).toEqual(payload);
    }
  });
});

describe('PATCH requests', () => {
  it('deve fazer requisição PATCH com payload', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const payload = { name: 'Patched' };
    const result = await client.patch<{
      method: string;
      body: unknown;
    }>('/echo', payload);

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.method).toBe('PATCH');
      expect(result.data.body).toEqual(payload);
    }
  });
});

describe('DELETE requests', () => {
  it('deve fazer requisição DELETE', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const result = await client.delete<{
      method: string;
      body: unknown;
    }>('/echo');

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.method).toBe('DELETE');
    }
  });

  it('deve fazer DELETE com payload', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const payload = { reason: 'Deleted by user' };
    const result = await client.delete<{
      method: string;
      body: unknown;
    }>('/echo', payload);

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.method).toBe('DELETE');
      expect(result.data.body).toEqual(payload);
    }
  });
});

describe('Error handling', () => {
  it('deve tratar erro de servidor (500)', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const result = await client.get('/server-error');

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    if (result.error) {
      expect(result.error.statusCode).toBe(500);
      expect(result.error.name).toBe('application_error');
    }
  });

  it('deve tratar erro de rede quando servidor não está disponível', async () => {
    const client = new HttpClient({
      url: 'http://localhost:99999',
    });

    const result = await client.get('/test');

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    if (result.error) {
      expect(result.error.name).toBe('application_error');
      expect(result.error.statusCode).toBeNull();
    }
    expect(result.headers).toBeNull();
  });
});

describe('Custom headers', () => {
  it('deve incluir headers customizados por requisição', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
    });

    const result = await client.get<{
      headers: Record<string, string>;
    }>('/echo', {
      headers: {
        'X-Custom-Header': 'custom-value',
        'X-Request-ID': '12345',
      },
    });

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.headers['x-custom-header']).toBe('custom-value');
      expect(result.data.headers['x-request-id']).toBe('12345');
    }
  });

  it('deve incluir headers do construtor em todas as requisições', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
      headers: {
        'X-Global-Header': 'global-value',
      },
    });

    const result = await client.get<{
      headers: Record<string, string>;
    }>('/echo');

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.headers['x-global-header']).toBe('global-value');
    }
  });

  it('deve sobrescrever headers do construtor com headers da requisição', async () => {
    const client = new HttpClient({
      url: `http://localhost:${serverPort}`,
      headers: {
        'X-Override': 'constructor-value',
      },
    });

    const result = await client.get<{
      headers: Record<string, string>;
    }>('/echo', {
      headers: {
        'X-Override': 'request-value',
      },
    });

    expect(result.error).toBeNull();
    if (result.data) {
      expect(result.data.headers['x-override']).toBe('request-value');
    }
  });
});

describe('Response type', () => {
  it('deve retornar data quando sucesso', () => {
    const successResult: Response<{ data: string }> = {
      data: { data: 'test' },
      error: null,
      headers: {},
    };

    expect(successResult.data).not.toBeNull();
    expect(successResult.error).toBeNull();
  });

  it('deve retornar error quando falha', () => {
    const failureResult: Response<unknown> = {
      data: null,
      error: {
        message: 'Error',
        statusCode: 400,
        name: 'test_error',
      },
      headers: {},
    };

    expect(failureResult.data).toBeNull();
    expect(failureResult.error).not.toBeNull();
  });
});
