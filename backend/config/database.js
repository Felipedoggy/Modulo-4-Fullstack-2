const mysql = require('mysql2');
require('dotenv').config();

// Primeiro, conectar sem especificar o banco de dados para criá-lo
const initConnection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
});

// Criar o banco de dados se não existir
initConnection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar com MySQL:', err);
    return;
  }
  
  console.log('Conectado ao MySQL para inicialização');
  
  // Criar o banco de dados se não existir
  initConnection.query('CREATE DATABASE IF NOT EXISTS finance_app', (err) => {
    if (err) {
      console.error('Erro ao criar banco de dados:', err);
    } else {
      console.log('Banco de dados finance_app verificado/criado');
    }
    initConnection.end();
  });
});

// Agora criar a conexão principal com o banco de dados
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finance_app',
  port: process.env.DB_PORT || 3306
});

// Conectar ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar com o banco finance_app:', err);
    return;
  }
  console.log('Conectado ao banco finance_app');
});

// Promisify para usar async/await
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = { connection, query };