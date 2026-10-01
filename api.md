# Documentação da API REST — Mini Sistema de Gerenciamento de Hardware

Esta documentação descreve todos os endpoints, convenções de dados, formatos de requisição e resposta, cabeçalhos e exemplos práticos com `curl` para a API REST de gerenciamento de aparelhos de hardware.

---

## 1. Visão Geral

- **Formato de Dados**: JSON (`application/json`)
- **Padrão de Resposta**:
  - **Sucesso**:
    ```json
    {
      "success": true,
      "data": { ... }
    }
    ```
  - **Erro**:
    ```json
    {
      "success": false,
      "error": {
        "message": "Descrição amigável do erro ocorrido"
      }
    }
    ```
- **Autenticação**: Acesso público aberto para consumo do frontend do catálogo.
- **CORS**: Habilitado para requisições externas e locais (`*` ou configurável via `FRONTEND_URL`).

---

## 2. URL Base

- **Desenvolvimento Local**: `http://localhost:3000/api`
- **Produção (Vercel)**: `https://<seu-projeto>.vercel.app/api`

---

## 3. Cabeçalhos HTTP Padrão

Para requisições que enviam dados no corpo (`POST`, `PUT`), é obrigatório o cabeçalho:

```http
Content-Type: application/json
Accept: application/json
```

---

## 4. Modelo de Dados (`Hardware`)

| Campo | Tipo | Obrigatório | Descrição | Regras de Validação |
|---|---|---|---|---|
| `id` | String (ObjectId) | Automático | Identificador único gerado pelo MongoDB | 24 caracteres hexadecimais |
| `hardware` | String | Sim | Nome ou categoria do aparelho | Mínimo 2 caracteres, máx 100 |
| `marca` | String | Sim | Fabricante da peça/aparelho | Mínimo 2 caracteres, máx 100 |
| `modelo` | String | Sim | Modelo específico do hardware | Mínimo 1 caractere, máx 100 |
| `preco` | Number | Sim | Valor monetário do aparelho | Não pode ser negativo (>= 0) |
| `foto` | String (URL) | Não | Link web para a foto do hardware | URL válida (http/https/data) ou vazio |
| `createdAt` | Date (ISO 8601) | Automático | Data e hora de criação | Gerado automaticamente |
| `updatedAt` | Date (ISO 8601) | Automático | Data e hora da última alteração | Gerado automaticamente |

---

## 5. Endpoints

### 5.1. Status da API (Healthcheck)

#### `GET /health`
Verifica se o serviço está em funcionamento.

- **URL Completa**: `http://localhost:3000/api/health`
- **Código HTTP de Sucesso**: `200 OK`

##### Exemplo de Resposta:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-10-01T14:15:00.000Z"
}
```

##### Exemplo com cURL:
```bash
curl -X GET http://localhost:3000/api/health
```

---

### 5.2. Listar Todos os Aparelhos

#### `GET /hardware`
Retorna todos os hardwares cadastrados no banco de dados, ordenados dos mais recentes para os mais antigos (`createdAt: -1`).

- **URL Completa**: `http://localhost:3000/api/hardware`
- **Código HTTP de Sucesso**: `200 OK`

##### Exemplo de Resposta:
```json
{
  "success": true,
  "data": [
    {
      "id": "670bf31c9a1d4b2e8a112233",
      "hardware": "Notebook Gamer",
      "marca": "Dell",
      "modelo": "G15 5530",
      "preco": 4899.90,
      "foto": "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
      "createdAt": "2026-10-01T14:00:00.000Z",
      "updatedAt": "2026-10-01T14:00:00.000Z"
    },
    {
      "id": "670bf31c9a1d4b2e8a112234",
      "hardware": "Placa de Vídeo",
      "marca": "Asus",
      "modelo": "RTX 4070 Dual",
      "preco": 3950.00,
      "foto": "",
      "createdAt": "2026-10-01T13:45:00.000Z",
      "updatedAt": "2026-10-01T13:45:00.000Z"
    }
  ]
}
```

##### Exemplo com cURL:
```bash
curl -X GET http://localhost:3000/api/hardware
```

---

### 5.3. Buscar Aparelho por ID

#### `GET /hardware/:id`
Busca e retorna os detalhes de um aparelho específico identificado pelo seu `id`.

- **Parâmetros de Rota**:
  - `id` (string, obrigatório): ID de 24 caracteres do MongoDB.
- **Códigos HTTP**:
  - `200 OK`: Encontrado com sucesso.
  - `400 Bad Request`: ID em formato inválido.
  - `404 Not Found`: Aparelho não encontrado no banco de dados.

##### Exemplo de Resposta (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "670bf31c9a1d4b2e8a112233",
    "hardware": "Notebook Gamer",
    "marca": "Dell",
    "modelo": "G15 5530",
    "preco": 4899.90,
    "foto": "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
    "createdAt": "2026-10-01T14:00:00.000Z",
    "updatedAt": "2026-10-01T14:00:00.000Z"
  }
}
```

##### Exemplo com cURL:
```bash
curl -X GET http://localhost:3000/api/hardware/670bf31c9a1d4b2e8a112233
```

---

### 5.4. Cadastrar Novo Aparelho

#### `POST /hardware`
Cadastra um novo aparelho de hardware no banco de dados.

- **URL Completa**: `http://localhost:3000/api/hardware`
- **Cabeçalho**: `Content-Type: application/json`
- **Corpo da Requisição (Body)**:
  ```json
  {
    "hardware": "Monitor Gamer",
    "marca": "LG",
    "modelo": "UltraGear 27 144Hz",
    "preco": 1299.99,
    "foto": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"
  }
  ```
- **Códigos HTTP**:
  - `201 Created`: Aparelho cadastrado com sucesso.
  - `400 Bad Request`: Dados inválidos, campos obrigatórios ausentes ou preço negativo.

##### Exemplo de Resposta (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "670bf31c9a1d4b2e8a112235",
    "hardware": "Monitor Gamer",
    "marca": "LG",
    "modelo": "UltraGear 27 144Hz",
    "preco": 1299.99,
    "foto": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
    "createdAt": "2026-10-01T14:15:30.123Z",
    "updatedAt": "2026-10-01T14:15:30.123Z"
  }
}
```

##### Exemplo com cURL:
```bash
curl -X POST http://localhost:3000/api/hardware \
  -H "Content-Type: application/json" \
  -d '{
    "hardware": "Monitor Gamer",
    "marca": "LG",
    "modelo": "UltraGear 27 144Hz",
    "preco": 1299.99,
    "foto": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"
  }'
```

---

### 5.5. Atualizar Aparelho Existente

#### `PUT /hardware/:id`
Atualiza dados de um aparelho existente identificado pelo `id`. Aceita atualização parcial ou total dos campos.

- **Parâmetros de Rota**:
  - `id` (string, obrigatório): ID de 24 caracteres do MongoDB.
- **Cabeçalho**: `Content-Type: application/json`
- **Corpo da Requisição (Body)**:
  ```json
  {
    "preco": 1199.00,
    "modelo": "UltraGear 27 165Hz"
  }
  ```
- **Códigos HTTP**:
  - `200 OK`: Aparelho atualizado com sucesso.
  - `400 Bad Request`: ID inválido ou valores com formato incorreto.
  - `404 Not Found`: Aparelho não encontrado para o ID fornecido.

##### Exemplo de Resposta (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "670bf31c9a1d4b2e8a112235",
    "hardware": "Monitor Gamer",
    "marca": "LG",
    "modelo": "UltraGear 27 165Hz",
    "preco": 1199.00,
    "foto": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
    "createdAt": "2026-10-01T14:15:30.123Z",
    "updatedAt": "2026-10-01T14:20:00.456Z"
  }
}
```

##### Exemplo com cURL:
```bash
curl -X PUT http://localhost:3000/api/hardware/670bf31c9a1d4b2e8a112235 \
  -H "Content-Type: application/json" \
  -d '{
    "preco": 1199.00,
    "modelo": "UltraGear 27 165Hz"
  }'
```

---

### 5.6. Excluir Aparelho

#### `DELETE /hardware/:id`
Remove permanentemente um aparelho de hardware do banco de dados.

- **Parâmetros de Rota**:
  - `id` (string, obrigatório): ID de 24 caracteres do MongoDB.
- **Códigos HTTP**:
  - `200 OK`: Excluído com sucesso.
  - `400 Bad Request`: Formato de ID inválido.
  - `404 Not Found`: Aparelho não encontrado para o ID fornecido.

##### Exemplo de Resposta (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Aparelho excluído com sucesso.",
    "id": "670bf31c9a1d4b2e8a112235"
  }
}
```

##### Exemplo com cURL:
```bash
curl -X DELETE http://localhost:3000/api/hardware/670bf31c9a1d4b2e8a112235
```

---

## 6. Tratamento de Erros e Códigos de Status

A API utiliza códigos HTTP semânticos e retorna mensagens descritivas:

| Código HTTP | Significado | Exemplo de Ocorrência |
|---|---|---|
| `200 OK` | Sucesso na requisição | Consulta, atualização ou exclusão bem-sucedida |
| `201 Created` | Recurso criado com sucesso | Cadastro de novo hardware |
| `400 Bad Request` | Dados inválidos | ID com formato incorreto, campo obrigatório ausente, preço negativo, JSON inválido |
| `404 Not Found` | Recurso inexistente | ID não encontrado no banco ou rota não existente |
| `500 Internal Server Error` | Erro interno | Falha inesperada durante a execução |
| `503 Service Unavailable` | Serviço indisponível | Banco de dados MongoDB inacessível ou URI incorreta |

### Exemplos de Respostas de Erro:

- **Campo Obrigatório Ausente (400 Bad Request)**:
```json
{
  "success": false,
  "error": {
    "message": "O campo hardware (nome/tipo) é obrigatório e deve ser um texto."
  }
}
```

- **ID do MongoDB Inválido (400 Bad Request)**:
```json
{
  "success": false,
  "error": {
    "message": "O ID informado ('123-invalido') não é um identificador válido do MongoDB."
  }
}
```

- **Registro Não Encontrado (404 Not Found)**:
```json
{
  "success": false,
  "error": {
    "message": "Aparelho de hardware não encontrado."
  }
}
```

- **Falha de Conexão com MongoDB (503 Service Unavailable)**:
```json
{
  "success": false,
  "error": {
    "message": "Falha ao conectar com o banco de dados MongoDB. Verifique a variável MONGODB_URI."
  }
}
```
