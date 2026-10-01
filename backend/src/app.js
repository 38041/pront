const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const hardwareRoutes = require('./routes/hardwareRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Configuração de CORS flexível para desenvolvimento e produção
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middlewares para parsing de corpo de requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de status / healthcheck da API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API do Mini Sistema de Gerenciamento de Hardware está online.',
    version: '1.0.0',
    endpoints: {
      hardware: '/api/hardware',
      health: '/api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Middleware para garantir conexão ativa com MongoDB antes de acessar rotas de dados
app.use('/api/hardware', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Falha ao conectar com o banco de dados MongoDB. Verifique a variável MONGODB_URI.',
      },
    });
  }
});

// Rotas de Hardware
app.use('/api/hardware', hardwareRoutes);

// Tratamento de rota não encontrada (404)
app.use(notFoundHandler);

// Tratamento global de erros
app.use(errorHandler);

module.exports = app;
