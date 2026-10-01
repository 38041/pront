# Roadmap — Mini Sistema de Gerenciamento de Hardware

## 1. Planejamento
- [x] Analisar requisitos e escopo do projeto
- [x] Definir arquitetura (Backend Node.js + Frontend Vanilla + MongoDB + Vercel)
- [x] Definir estrutura de pastas do projeto
- [x] Definir modelo de dados (Hardware, marca, modelo, preco, foto, timestamps)
- [x] Definir endpoints da API REST e formato padronizado de respostas
- [x] Criar documentação inicial: Roadmap.md e Contexto.md

## 2. Backend
- [x] Inicializar projeto Node.js (`package.json`, scripts e dependências)
- [x] Configurar conexão com MongoDB (Mongoose com suporte a serverless/Vercel)
- [x] Criar Model `Hardware` com validações de esquema
- [x] Criar Middlewares (CORS, JSON parser, validador de ObjectId, tratamento de erros centralizado)
- [x] Criar Controllers para operações CRUD
- [x] Criar Routes (`/api/hardware`)
- [x] Implementar CRUD completo com tratamento de status HTTP e validações
- [x] Configurar `.env` e `.env.example` com suporte a link de conexão do MongoDB
- [x] Configurar suporte a deploy serverless na Vercel (`vercel.json` e `api/index.js`)

## 3. Testes do Backend
- [x] Implementar testes automatizados da API (GET, POST, PUT, DELETE, validações de erro)
- [x] Testar conexão com MongoDB (suporte a link do MongoDB Atlas e mock para testes)
- [x] Testar cenários de sucesso e casos de borda (IDs inválidos, campos obrigatórios, preço negativo)
- [x] Validar respostas padronizadas (`{ success: true, data }` e `{ success: false, error }`)

## 4. Frontend
- [x] Criar estrutura semântica `index.html` (formulário de cadastro/edição, listagem em cards, feedback visual)
- [x] Criar estilos responsivos `style.css` (moderno, limpo, mobile-friendly, loading spinner, badges)
- [x] Criar lógica `script.js` (gerenciamento de estado, consumo com `fetch`, centralização da URL da API)
- [x] Implementar listagem dinâmica de aparelhos com cards e placeholder de imagens
- [x] Implementar cadastro de novo aparelho
- [x] Implementar edição de aparelho com preenchimento automático do formulário
- [x] Implementar exclusão com confirmação em modal
- [x] Implementar estados de carregamento (loading), mensagens de erro e feedback visual amigável

## 5. Integração e Validação Ponta a Ponta
- [x] Testar fluxo completo: Frontend -> API -> MongoDB -> API -> Frontend
- [x] Testar comportamento com API indisponível ou erros de rede
- [x] Testar responsividade em viewport desktop e mobile

## 6. Documentação e Preparação para Deploy
- [x] Criar `api.md` com documentação detalhada de todos os endpoints e exemplos de `curl`
- [x] Criar `README.md` completo com guia de execução local, configuração do link do MongoDB Atlas e deploy na Vercel
- [x] Criar `.gitignore` para segurança
- [x] Atualizar `Contexto.md` com o estado final
- [x] Atualizar `Roadmap.md` marcando todas as etapas concluídas
