const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('Iniciando o servidor backend...');
    
    // Tenta conectar ao MongoDB se a URI estiver configurada
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn('AVISO: MONGODB_URI não definida no arquivo .env. Configure sua string de conexão para persistir dados.');
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` Servidor rodando com sucesso!`);
      console.log(` URL Local:     http://localhost:${PORT}`);
      console.log(` API Hardware:  http://localhost:${PORT}/api/hardware`);
      console.log(` Healthcheck:   http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Falha ao inicializar o servidor:', error);
    process.exit(1);
  }
}

startServer();
