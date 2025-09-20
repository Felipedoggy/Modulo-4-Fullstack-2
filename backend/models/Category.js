const { query } = require('../config/database');

class Category {
  // Criar categoria (agora sem user_id)
  static async create(categoryData) {
    const { name } = categoryData;
    
    const sql = 'INSERT INTO categories (name) VALUES (?)';
    const result = await query(sql, [name]);
    
    return this.findById(result.insertId);
  }

  // Encontrar categoria por nome
  static async findByName(name) {
    const sql = 'SELECT * FROM categories WHERE name = ?';
    const categories = await query(sql, [name]);
    return categories[0];
  }

  // Encontrar categoria por ID
  static async findById(id) {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    const categories = await query(sql, [id]);
    return categories[0];
  }

  // Encontrar categorias do usuário (através da tabela intermediária)
  static async findByUserId(userId) {
    const sql = `
      SELECT c.* FROM categories c
      JOIN user_categories uc ON c.id = uc.category_id
      WHERE uc.user_id = ?
      ORDER BY c.name
    `;
    return await query(sql, [userId]);
  }

  // Adicionar categoria a um usuário
  static async addCategoryToUser(categoryId, userId) {
    const sql = 'INSERT IGNORE INTO user_categories (user_id, category_id) VALUES (?, ?)';
    await query(sql, [userId, categoryId]);
  }

  // Remover categoria de um usuário
  static async removeCategoryFromUser(categoryId, userId) {
    const sql = 'DELETE FROM user_categories WHERE user_id = ? AND category_id = ?';
    await query(sql, [userId, categoryId]);
  }

  // Remover categoria de todos os usuários
  static async removeCategoryFromAllUsers(categoryId) {
    const sql = 'DELETE FROM user_categories WHERE category_id = ?';
    await query(sql, [categoryId]);
  }

  // Verificar se a categoria pertence ao usuário
  static async belongsToUser(categoryId, userId) {
    const sql = `
      SELECT uc.id FROM user_categories uc
      WHERE uc.category_id = ? AND uc.user_id = ?
    `;
    const associations = await query(sql, [categoryId, userId]);
    return associations.length > 0;
  }

  // Atualizar categoria
  static async update(id, name) {
    const sql = 'UPDATE categories SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [name, id]);
    return this.findById(id);
  }

  // Deletar categoria
  static async delete(id) {
    const sql = 'DELETE FROM categories WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
  static async exists(categoryId) {
  const sql = 'SELECT id FROM categories WHERE id = ?';
  const categories = await query(sql, [categoryId]);
  return categories.length > 0;
}

// Obter todas as categorias disponíveis
static async getAll() {
  const sql = 'SELECT * FROM categories ORDER BY name';
  return await query(sql);
}

// Associar todas as categorias padrão a um usuário
static async assignAllCategoriesToUser(userId) {
  try {
    // Obter todas as categorias
    const allCategories = await this.getAll();
    
    // Associar cada categoria ao usuário
    for (const category of allCategories) {
      await this.addCategoryToUser(category.id, userId);
    }
    
    console.log(`Todas as categorias associadas ao usuário ${userId}`);
    return true;
  } catch (error) {
    console.error('Erro ao associar categorias:', error);
    return false;
  }
}
}


module.exports = Category;