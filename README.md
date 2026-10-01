# 💻 Mini Sistema de Gerenciamento de Hardware

Aplicação web completa para cadastro, visualização, edição e exclusão de aparelhos de hardware (nome/hardware, marca, modelo, preço e foto), com arquitetura desacoplada (Frontend separado do Backend), banco de dados MongoDB (Atlas / Local) e preparação para deploy serverless na Vercel.

---

## 📌 Sumário
1. [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
2. [Estrutura do Projeto](#-estrutura-do-projeto)
3. [Configuração do Banco de Dados MongoDB](#-configuração-do-banco-de-dados-mongodb)
4. [Instalação e Execução Local](#-instalação-e-execução-local)
5. [Execução dos Testes Automatizados](#-execução-dos-testes-automatizados)
6. [Deploy da API na Vercel](#-deploy-da-api-na-vercel)
7. [Documentação da API](#-documentação-da-api)
8. [Segurança e Boas Práticas](#-segurança-e-boas-práticas)

---

## 🛠 Arquitetura e Tecnologias

- **Backend**:
  - **Node.js** com **Express.js** estruturado no padrão MVC / REST.
  - **Mongoose** para modelagem, validação de tipos e gerenciamento de timestamps.
  - **CORS** habilitado para permitir comunicação cross-origin com o frontend.
  - **Conexão resiliente com cache** para compatibilidade com ambiente serverless (Vercel).
- **Frontend**:
  - **HTML5**, **CSS3** e **JavaScript (Vanilla / ES6+)** puros, sem dependência de frameworks.
  - Consumo assíncrono via `fetch` nativo.
  - Layout totalmente responsivo com CSS Grid e Flexbox.
  - Validação client-side, estados de loading, feedback por toasts e modal de confirmação.
- **Banco de Dados**:
  - **MongoDB** (suporte nativo ao MongoDB Atlas e instâncias locais).
- **Deploy**:
  - Backend configurado para Vercel Serverless Functions através do `vercel.json` e handler em `backend/api/index.js`.

---

## 📂 Estrutura do Projeto

```text
/
├── /backend
│   ├── /src
│   │   ├── /config
│   │   │   └── db.js              # Conexão com MongoDB e cache serverless
│   │   ├── /controllers
│   │   │   └── hardwareController.js # Lógica do CRUD e validações
│   │   ├── /models
│   │   │   └── Hardware.js        # Schema Mongoose com validações de dados
│   │   ├── /routes
│   │   │   └── hardwareRoutes.js  # Definição das rotas REST
│   │   ├── /middlewares
│   │   │   └── errorHandler.js    # Tratamento centralizado de erros e 404
│   │   └── app.js                 # Configuração Express e CORS
│   ├── /api
│   │   └── index.js               # Ponto de entrada Serverless da Vercel
│   ├── /tests
│   │   └── hardware.test.js       # Suíte de testes automatizados com node:test
│   ├── server.js                  # Inicialização do servidor local
│   ├── package.json               # Dependências e scripts
│   ├── vercel.json                # Configurações de rotas para Vercel
│   └── .env.example               # Modelo de variáveis de ambiente
│
├── /frontend
│   ├── index.html                 # Interface gráfica SPA semântica
│   ├── style.css                  # Folha de estilo responsiva e moderna
│   └── script.js                  # Lógica de consumo da API REST e manipulação DOM
│
├── Roadmap.md                     # Acompanhamento das etapas do desenvolvimento
├── Contexto.md                    # Memória técnica contínua do projeto
├── api.md                         # Documentação completa dos endpoints e exemplos cURL
├── README.md                      # Instruções de instalação, uso e deploy
└── .gitignore                     # Arquivos ignorados pelo Git
```

---

## 🍃 Configuração do Banco de Dados MongoDB

O sistema necessita de uma string de conexão com o MongoDB definida na variável de ambiente `MONGODB_URI`.

### Opção 1: MongoDB Atlas (Nuvem — Gratuito e Recomendado para Vercel)

1. Crie uma conta gratuita em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crie um cluster gratuito (**M0 Free Tier**).
3. Em **Security > Database Access**:
   - Clique em **Add New Database User**.
   - Crie um usuário com usuário e senha (ex: `admin_hardware` / `SuaSenhaForte123`).
   - Conceda permissão de **Read and write to any database**.
4. Em **Security > Network Access**:
   - Clique em **Add IP Address**.
   - Selecione **Allow Access from Anywhere** (`0.0.0.0/0`) para permitir conexões das funções serverless da Vercel.
5. Em **Databases**:
   - Clique em **Connect > Drivers > Node.js**.
   - Copie a Connection String (URI).
   - O formato será:
     ```text
     mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/hardware_db?retryWrites=true&w=majority
     ```
   - Substitua `<usuario>`, `<senha>` e defina o nome do banco como `hardware_db`.

### Opção 2: MongoDB Local

Se possuir o MongoDB instalado localmente na sua máquina:
```text
MONGODB_URI=mongodb://localhost:27017/hardware_db
```

---

## 🚀 Instalação e Execução Local

### 1. Clonar ou Acessar a Pasta do Projeto
Abra o terminal na pasta do projeto:
```bash
cd "c:\Users\Aluno\Documents\alessa pront"
```

### 2. Configurar o Backend
Acesse a pasta `/backend`:
```bash
cd backend
```

Instale as dependências:
```bash
npm install
```

Crie o arquivo de variáveis de ambiente `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```
*(No Windows PowerShell: `Copy-Item .env.example .env`)*

Edite o arquivo `backend/.env` e insira sua string de conexão real do MongoDB:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<senha>@seu-cluster.mongodb.net/hardware_db?retryWrites=true&w=majority
FRONTEND_URL=*
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
# Ou para execução padrão:
npm start
```

O servidor iniciará em: **`http://localhost:3000`**

### 3. Executar o Frontend
Como o frontend é composto por arquivos estáticos puros (HTML/CSS/JS), você pode executá-lo de duas formas:

- **Forma 1 (Extensão Live Server no VS Code)**:
  - Abra a pasta do projeto no VS Code, clique com o botão direito em `frontend/index.html` e selecione **Open with Live Server**.

- **Forma 2 (Servidor HTTP local simples via Node.js / npx)**:
  Abra um novo terminal na pasta `frontend`:
  ```bash
  npx serve .
  # Ou simplesmente abra o arquivo frontend/index.html no navegador!
  ```

---

## 🧪 Execução dos Testes Automatizados

O projeto conta com uma suíte de testes automatizados completa cobrindo todos os fluxos da API:
- Status e Healthcheck (`GET /`, `GET /api/health`)
- Cadastro com sucesso e validação de erros (`POST /api/hardware`)
- Listagem ordenada descrescente (`GET /api/hardware`)
- Consulta por ID, rejeição de formato inválido e 404 (`GET /api/hardware/:id`)
- Atualização e rejeição de dados incorretos (`PUT /api/hardware/:id`)
- Exclusão com confirmação e tratamento de erros (`DELETE /api/hardware/:id`)

Os testes utilizam o banco em memória `mongodb-memory-server`, permitindo a execução imediata em qualquer ambiente sem necessidade de banco externo ligado:

Para rodar os testes:
```bash
cd backend
npm test
```

---

## ☁️ Deploy da API na Vercel

O backend está 100% preparado para ser publicado no ambiente Serverless da Vercel.

### Passo a Passo:

1. **Subir o código para o GitHub / GitLab / Bitbucket**:
   ```bash
   git init
   git add .
   git commit -m "feat: backend e frontend de gerenciamento de hardware"
   git branch -M main
   git remote add origin <url-do-seu-repositorio>
   git push -u origin main
   ```

2. **Importar o Projeto na Vercel**:
   - Acesse o painel da [Vercel](https://vercel.com) e clique em **Add New Project**.
   - Selecione o repositório do seu projeto.
   - No campo **Root Directory**, selecione a pasta `backend`.

3. **Configurar as Variáveis de Ambiente na Vercel**:
   - Na seção **Environment Variables**, adicione:
     - **Nome**: `MONGODB_URI`
     - **Valor**: Sua URL do MongoDB Atlas (ex: `mongodb+srv://...`)
     - **Nome**: `FRONTEND_URL` (opcional)
     - **Valor**: `*` ou o domínio do seu frontend publicado.

4. **Realizar o Deploy**:
   - Clique em **Deploy**.
   - A Vercel criará automaticamente os endpoints serverless mapeando as requisições para `api/index.js`.
   - Copie a URL gerada (exemplo: `https://meu-hardware-api.vercel.app`).

5. **Conectar o Frontend à API na Vercel**:
   - Abra o `frontend/index.html` no navegador.
   - Clique no ícone de engrenagem ⚙️ no topo direito.
   - Insira a URL da API da Vercel: `https://meu-hardware-api.vercel.app/api/hardware` e clique em **Salvar**.
   - O frontend passará a consumir sua API publicada na nuvem instantaneamente!

---

## 📖 Documentação da API

A documentação detalhada de todos os endpoints, corpos de requisição e respostas padronizadas está disponível no arquivo [api.md](api.md).

### Resumo dos Endpoints REST:

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Verifica status de saúde da API |
| `GET` | `/api/hardware` | Retorna lista de todos os aparelhos |
| `GET` | `/api/hardware/:id` | Retorna dados de um aparelho específico |
| `POST` | `/api/hardware` | Cria um novo aparelho |
| `PUT` | `/api/hardware/:id` | Atualiza um aparelho existente |
| `DELETE` | `/api/hardware/:id` | Remove um aparelho |

---

## 🔒 Segurança e Boas Práticas

- Nenhuma credencial ou senha é incluída no código-fonte.
- Variáveis sensíveis são carregadas exclusivamente via `.env`.
- Tratamento defensivo de entradas contra injeção de parâmetros ou IDs malformatados.
- IDs do MongoDB validados antes de qualquer consulta para prevenir exceções no banco.
- Tratamento centralizado de erros sem exposição de stack traces internos em produção.
- Controle de CORS configurável para restringir acessos indevidos em produção.
