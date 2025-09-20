const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Criar usuário
  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const result = await query(sql, [name, email, hashedPassword]);
    
    return {
      id: result.insertId,
      name,
      email
    };
  }

  // Encontrar usuário por email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await query(sql, [email]);
    return users[0];
  }

  // Encontrar usuário por ID
  static async findById(id) {
    const sql = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
    const users = await query(sql, [id]);
    return users[0];
  }

  // Comparar senha
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = User;