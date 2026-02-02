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

A URL base é opcional. Se não fornecida, você pode usar endpoints completos:

```typescript
// Com URL base
const client = new HttpClient({
  url: 'https://api.example.com',
});

// Sem URL base (use endpoints completos)
const client = new HttpClient();
const result = await client.get('https://api.example.com/users/1');
```

### Headers Globais

Headers definidos no construtor são enviados em todas as requisições. O header `Content-Type: application/json` é adicionado automaticamente por padrão:

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

O body é obrigatório para requisições PUT:

```typescript
const result = await client.put<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
});

// Com headers customizados
const result = await client.put<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
}, {
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### PATCH

O body é obrigatório para requisições PATCH:

```typescript
const result = await client.patch<UpdatedUser>('/users/1', {
  name: 'Jane Doe',
});

// Com headers customizados
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

// Com body
const result = await client.delete<Response>('/users/1', {
  reason: 'Deleted by user',
});
```

## Tratamento de Respostas

Todas as requisições retornam um objeto `Response<T>` com a seguinte estrutura:

```typescript
type Response<T> = 
  | { data: T; error: null }
  | { data: null; error: ErrorResponse };
```

### Exemplo de Sucesso

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

### Erros de Rede

Quando a requisição não pode ser resolvida (erro de rede, CORS, etc.), o `statusCode` será `null`:

```typescript
const result = await client.get<User>('/users/1');

if (result.error) {
  if (result.error.statusCode === null) {
    // Erro de rede - requisição não pôde ser resolvida
    console.error('Erro de rede:', result.error.message);
  } else {
    // Erro HTTP - requisição foi feita mas retornou erro
    console.error('Erro HTTP:', result.error.statusCode, result.error.message);
  }
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

// Response<T> - Tipo de retorno de todas as requisições
type Response<T> = 
  | { data: T; error: null }
  | { data: null; error: ErrorResponse };

// ErrorResponse - Estrutura de erro
interface ErrorResponse {
  message: string;
  statusCode: number | null;
  name: string;
}

// ClientConfig - Configuração do construtor
interface ClientConfig {
  url?: string; // URL base (opcional)
  headers?: HeadersInit; // Headers globais (Headers, Record, ou Array)
}

// RequestConfig - Configuração por requisição
interface RequestConfig {
  headers?: HeadersInit; // Headers específicos da requisição
}
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
