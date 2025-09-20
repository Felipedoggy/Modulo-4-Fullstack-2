const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar conexão com o banco
const { connection } = require('./config/database');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Financeira com JWT e MySQL',
    status: 'Online',
    database: connection.state // Mostra o estado da conexão
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  const dbStatus = connection.state === 'authenticated' ? 'Conectado' : 'Desconectado';
  res.json({ 
    status: 'OK', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Verificar se conseguimos conectar ao banco antes de iniciar o servidor
connection.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.message);
    console.log('📋 Executando script de inicialização do banco...');
    
    // Tentar executar o script de inicialização
    const { exec } = require('child_process');
    exec('npm run init-db', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro ao executar script de inicialização:', error);
        return;
      }
      console.log('✅ Script de inicialização executado:', stdout);
      
      // Tentar conectar novamente
      connection.connect((retryErr) => {
        if (retryErr) {
          console.error('❌ Ainda não foi possível conectar ao banco:', retryErr.message);
        } else {
          console.log('✅ Conectado ao banco de dados após inicialização');
        }
      });
    });
  } else {
    console.log('✅ Conectado ao banco finance_app');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

// Popular categorias para usuários existentes ao iniciar
const populateUserCategories = require('./scripts/populate-user-categories');

connection.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco finance_app');
    // Popular categorias para usuários existentes
    populateUserCategories();
  }
});
// Exportar para testes
module.exports = app;