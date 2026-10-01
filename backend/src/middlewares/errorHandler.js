/**
 * Middleware centralizado de tratamento de erros.
 * Garante que todas as falhas retornem o formato padronizado:
 * { "success": false, "error": { "message": "..." } }
 */
function errorHandler(err, req, res, next) {
  // Log de depuração interna
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // Erro de JSON mal formatado no body da requisição
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'JSON inválido no corpo da requisição.',
      },
    });
  }

  // Erro de validação do Mongoose (campos obrigatórios, limites, formato de URL)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: {
        message: messages.join(' '),
      },
    });
  }

  // Erro de CastError do Mongoose (ex: ID que não é um ObjectId válido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        message: `Identificador inválido: '${err.value}'.`,
      },
    });
  }

  // Erros com status code customizado já definidos
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Ocorreu um erro interno no servidor.' : err.message;

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  });
}

/**
 * Middleware para rotas não encontradas (404)
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
