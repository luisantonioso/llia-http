# @llia/http

Biblioteca HTTP client simples e type-safe para fazer requisições HTTP com TypeScript.

## Instalação

```bash
bun install @llia/http
```

ou

```bash
npm install @llia/http
```

## Uso Básico

```typescript
import { HttpClient } from '@llia/http';

// Criar instância do cliente
const client = new HttpClient({
  url: 'https://api.example.com',
});

// GET request
const result = await client.get<{ id: number; name: string }>('/users/1');

if (result.error) {
  console.error('Erro:', result.error.message);
} else {
  console.log('Dados:', result.data);
}
```

## Configuração

### URL Base

```typescript
const client = new HttpClient({
  url: 'https://api.example.com',
});
```

### Headers Globais

Headers definidos no construtor são enviados em todas as requisições:

```typescript
const client = new HttpClient({
  url: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer token123',
    'X-API-Key': 'my-api-key',
  },
});
```

## Métodos HTTP

### GET

```typescript
const result = await client.get<User>('/users/1');

// Com headers customizados
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

// Sem body
const result = await client.post<Response>('/endpoint');
```

### PUT

```typescript
const result = await client.put<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
});
```

### PATCH

```typescript
const result = await client.patch<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
});
```

### DELETE

```typescript
const result = await client.delete<void>('/users/1');

// Com body
const result = await client.delete<Response>('/users/1', {
  reason: 'Deleted by user',
});
```

## Tratamento de Respostas

Todas as requisições retornam um objeto `Response<T>` com a seguinte estrutura:

```typescript
type Response<T> = 
  | { data: T; error: null; headers: Record<string, string> | null }
  | { data: null; error: ErrorResponse; headers: Record<string, string> | null };
```

### Exemplo de Sucesso

```typescript
const result = await client.get<User>('/users/1');

if (result.error === null) {
  console.log(result.data); // User
  console.log(result.headers); // Headers da resposta
} else {
  console.error(result.error.message);
  console.error(result.error.statusCode);
  console.error(result.error.name);
}
```

### Exemplo de Erro

```typescript
const result = await client.get<User>('/users/999');

if (result.error) {
  console.error('Mensagem:', result.error.message);
  console.error('Status:', result.error.statusCode);
  console.error('Tipo:', result.error.name);
} else {
  console.log(result.data);
}
```

## Headers por Requisição

Headers passados em uma requisição específica sobrescrevem os headers globais:

```typescript
const client = new HttpClient({
  url: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer default-token',
  },
});

// Esta requisição usará 'Bearer custom-token' ao invés de 'Bearer default-token'
const result = await client.get('/users', {
  headers: {
    Authorization: 'Bearer custom-token',
  },
});
```

## Tipos

```typescript
import type { Response, ErrorResponse, ClientConfig, RequestConfig } from '@llia/http';

// ClientConfig - Configuração do construtor
const config: ClientConfig = {
  url: 'https://api.example.com',
  headers: { /* ... */ },
};

// RequestConfig - Configuração por requisição
const options: RequestConfig = {
  headers: { /* ... */ },
};

// ErrorResponse - Estrutura de erro
const error: ErrorResponse = {
  message: string;
  statusCode: number | null;
  name: string;
};
```

## Scripts

```bash
# Executar testes
bun test

# Build
bun run build

# Lint
bun run lint

# Lint e corrigir
bun run lint:fix
```
