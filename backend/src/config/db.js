const mongoose = require('mongoose');

// Cache global da conexão para ambientes serverless (Vercel) e desenvolvimento local
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Conecta ao banco de dados MongoDB utilizando Mongoose com suporte a cache de conexão.
 * @returns {Promise<typeof mongoose>} Conexão Mongoose ativa
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('A variável de ambiente MONGODB_URI não está definida. Verifique seu arquivo .env ou as configurações da Vercel.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('MongoDB conectado com sucesso!');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('Erro ao conectar ao MongoDB:', error.message);
    throw error;
  }

  return cached.conn;
}

module.exports = connectDB;
