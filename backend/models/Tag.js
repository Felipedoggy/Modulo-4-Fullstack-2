const { query } = require('../config/database');

class Tag {
  static async create(name, color = '#007bff') {
    const sql = 'INSERT INTO tags (name, color) VALUES (?, ?)';
    const result = await query(sql, [name, color]);
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM tags WHERE id = ?';
    const tags = await query(sql, [id]);
    return tags[0];
  }

  static async findAll() {
    const sql = 'SELECT * FROM tags ORDER BY name';
    return await query(sql);
  }

  static async addTagToExpense(expenseId, tagId) {
    const sql = 'INSERT INTO expense_tags (expense_id, tag_id) VALUES (?, ?)';
    await query(sql, [expenseId, tagId]);
  }

  static async removeTagFromExpense(expenseId, tagId) {
    const sql = 'DELETE FROM expense_tags WHERE expense_id = ? AND tag_id = ?';
    await query(sql, [expenseId, tagId]);
  }

  static async getTagsForExpense(expenseId) {
    const sql = `
      SELECT t.* FROM tags t
      JOIN expense_tags et ON t.id = et.tag_id
      WHERE et.expense_id = ?
    `;
    return await query(sql, [expenseId]);
  }
}

module.exports = Tag;