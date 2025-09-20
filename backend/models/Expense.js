const { query } = require('../config/database');

class Expense {
  // Criar despesa
  static async create(expenseData) {
    const { description, amount, date, category_id, user_id } = expenseData;
    
    const sql = `
      INSERT INTO expenses (description, amount, date, category_id, user_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [description, amount, date, category_id, user_id]);
    
    return this.findById(result.insertId);
  }

  // Encontrar todas as despesas do usuário
  static async findByUserId(userId) {
    const sql = `
      SELECT e.*, c.name as category_name 
      FROM expenses e 
      JOIN categories c ON e.category_id = c.id 
      WHERE e.user_id = ? 
      ORDER BY e.date DESC
    `;
    return await query(sql, [userId]);
  }

  // Encontrar despesa por ID
  static async findById(id) {
    const sql = `
      SELECT e.*, c.name as category_name 
      FROM expenses e 
      JOIN categories c ON e.category_id = c.id 
      WHERE e.id = ?
    `;
    const expenses = await query(sql, [id]);
    return expenses[0];
  }

  // Atualizar despesa
  static async update(id, expenseData) {
    const { description, amount, date, category_id } = expenseData;
    
    const sql = `
      UPDATE expenses 
      SET description = ?, amount = ?, date = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    await query(sql, [description, amount, date, category_id, id]);
    
    return this.findById(id);
  }

  // Deletar despesa
  static async delete(id) {
    const sql = 'DELETE FROM expenses WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Verificar se a despesa pertence ao usuário
  static async belongsToUser(expenseId, userId) {
    const sql = 'SELECT id FROM expenses WHERE id = ? AND user_id = ?';
    const expenses = await query(sql, [expenseId, userId]);
    return expenses.length > 0;
  }
}

module.exports = Expense;