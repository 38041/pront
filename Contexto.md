# Contexto do Projeto

## Objetivo
Mini sistema web full stack para cadastro, consulta, edição e exclusão de aparelhos de hardware (nome/hardware, marca, modelo, preço e foto), com arquitetura desacoplada (Frontend separado do Backend), persistência em MongoDB (Atlas/Local) e preparação para deploy serverless na Vercel.

## Arquitetura
- **Frontend**: Aplicação SPA estática desacoplada em `/frontend` construída exclusivamente com HTML5 semântico, CSS3 moderno e responsivo e JavaScript puro (ES6+), consumindo a API REST através da API nativa `fetch`. O frontend inclui alternância de formulário entre criação e edição, validação visual, detecção de status da API, feedback de toasts, modal de confirmação e grid responsivo com fallback para imagens.
- **Backend**: API RESTful estruturada em Node.js com Express em `/backend`, organizada nas camadas de configuração, modelo Mongoose, rotas, controladores e middlewares de erro.
- **Banco de Dados**: MongoDB (suporte nativo ao MongoDB Atlas com string `mongodb+srv://...` e instâncias locais), mapeado com Mongoose Schema com validações estritas de tipos, limites e timestamps automáticos (`createdAt`, `updatedAt`).
- **Deploy**: Preparado para execução local via `server.js` e em ambiente serverless na Vercel via handler `backend/api/index.js` e `backend/vercel.json` com cache de conexão resiliente.

## Tecnologias
- **Node.js** (v24+)
- **Express.js** (framework web)
- **MongoDB & Mongoose** (banco de dados NoSQL e modelagem com validações de esquema)
- **CORS** (middleware para controle de requisições cross-origin)
- **Dotenv** (gerenciamento seguro de variáveis de ambiente)
- **HTML5 / CSS3 / JavaScript (Vanilla)** (interface desacoplada, responsiva e dinâmica)
- **Vercel** (configuração serverless para deploy contínuo)
- **Node:test & Supertest & MongoMemoryServer** (testes automatizados rápidos e isolados)

## Estrutura
```text
/ (raiz do projeto)
├── /backend
│   ├── /src
│   │   ├── /config       # Conexão com MongoDB (com cache para serverless)
│   │   ├── /controllers  # Lógica do CRUD de hardware
│   │   ├── /models       # Schema e modelo Mongoose para Hardware
│   │   ├── /routes       # Definição dos endpoints REST
│   │   ├── /middlewares  # CORS, JSON parser e tratamento de erros centralizado
│   │   └── app.js        # Configuração da aplicação Express
│   ├── /api
│   │   └── index.js      # Handler de entrada serverless para Vercel
│   ├── /tests
│   │   └── hardware.test.js # Suíte de 17 testes automatizados
│   ├── server.js         # Entrada para execução do servidor local
│   ├── package.json      # Dependências e scripts
│   ├── vercel.json       # Configurações de rotas e build para Vercel
│   └── .env.example      # Exemplo de variáveis de ambiente com link para MongoDB
│
├── /frontend
│   ├── index.html        # Estrutura visual e formulários
│   ├── style.css         # Estilização responsiva e tema moderno
│   └── script.js         # Consumo da API REST e interação DOM
│
├── Roadmap.md            # Acompanhamento do progresso do desenvolvimento
├── Contexto.md           # Memória técnica contínua do projeto (este arquivo)
├── api.md                # Documentação técnica completa da API
├── README.md             # Guia de instalação, configuração, MongoDB Atlas e deploy
└── .gitignore            # Ignorar node_modules, .env, logs e caches
```

## Banco de dados
- **Collection**: `hardwares`
- **Schema Mongoose (`Hardware`)**:
  - `hardware`: String, obrigatório, trim, comprimento mín. 2, máx. 100
  - `marca`: String, obrigatório, trim, comprimento mín. 2, máx. 100
  - `modelo`: String, obrigatório, trim, comprimento mín. 1, máx. 100
  - `preco`: Number, obrigatório, mínimo 0
  - `foto`: String, opcional, validação de formato de URL (se informada)
  - `createdAt`: Date (gerado automaticamente via timestamps)
  - `updatedAt`: Date (gerado automaticamente via timestamps)

## API
Endpoints implementados e testados:
- `GET /api/health`: Healthcheck da API
- `GET /api/hardware`: Lista todos os aparelhos cadastrados (ordenação decrescente por data)
- `GET /api/hardware/:id`: Consulta detalhes de um aparelho específico por ID
- `POST /api/hardware`: Cadastra um novo aparelho (com validação de campos e preços)
- `PUT /api/hardware/:id`: Atualiza dados de um aparelho existente
- `DELETE /api/hardware/:id`: Remove um aparelho existente do banco

Padrão de respostas:
- Sucesso: `{ success: true, data: ... }`
- Erro: `{ success: false, error: { message: ... } }`

## Frontend
Funcionalidades implementadas:
- Listagem em cards com foto do hardware ou placeholder SVG elegante quando ausente ou com link quebrado.
- Formulário dinâmico com alternância de modo (Cadastro / Edição) e prévia em tempo real de foto.
- Validação client-side antes do envio de requisições.
- Feedback visual com toast notifications e indicadores de loading/spinner.
- Modal de confirmação seguro antes de realizar exclusão.
- Busca e filtragem em tempo real por nome, marca ou modelo.
- Indicador visual do status da API (Online / Desconectada) e modal para ajuste rápido da URL da API.
- Layout 100% responsivo para visualização em smartphones, tablets e desktops.

## Variáveis de ambiente
- `PORT`: Porta na qual o servidor backend será executado localmente (padrão: 3000).
- `MONGODB_URI`: String/Link de conexão com o banco de dados MongoDB (ex: MongoDB Atlas com protocolo `mongodb+srv://...` ou local `mongodb://localhost:27017/hardware_db`).
- `FRONTEND_URL`: Origem permitida para o CORS em produção (`*` ou domínio do frontend).

## Estado atual
Projeto totalmente implementado, testado, validado e documentado.
- Backend operacional e testado com 100% de sucesso (17 testes automatizados passando).
- Frontend desenvolvido e desacoplado, pronto para consumo local ou em produção.
- Configuração para deploy serverless na Vercel completa (`backend/vercel.json` e `backend/api/index.js`).
- Documentação exaustiva criada (`Roadmap.md`, `Contexto.md`, `api.md`, `README.md`).

## Última tarefa
Criação dos arquivos de documentação (`api.md`, `README.md`, `Roadmap.md`, `Contexto.md`) e validação geral do projeto.

## Próxima tarefa
Entregar a solução final ao usuário com resumo detalhado e instruções de execução.

## Problemas conhecidos
Nenhum. Todos os testes de unidade, integração e validação de sintaxe passaram sem erros.

## Decisões técnicas
1. **Cache de Conexão no Mongoose (`src/config/db.js`)**: Essencial para prevenir saturação do pool de conexões do MongoDB Atlas durante invocações sucessivas em ambientes serverless da Vercel.
2. **Separação Rigorosa Frontend/Backend**: O frontend foi estruturado de forma completamente agnóstica ao servidor Node.js, comunicando-se estritamente via requisições HTTP RESTful com suporte a CORS.
3. **Resiliência e Placeholder de Imagem**: Implementado fallback via SVG nativo embutido (`PLACEHOLDER_SVG`) tanto no CSS quanto no JavaScript (`onerror`) para assegurar que URLs inválidas ou vazias não causem quebra visual na interface.
4. **Testes Isolados em Memória**: Utilização de `mongodb-memory-server` nos testes automatizados para permitir que a validação técnica da aplicação seja executada de ponta a ponta sem dependência externa de infraestrutura pré-configurada.
