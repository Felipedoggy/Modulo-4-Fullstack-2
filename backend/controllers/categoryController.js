const Category = require('../models/Category');

// Criar categoria
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Verificar se categoria já existe (agora é única globalmente)
    const categoryExists = await Category.findByName(name);
    if (categoryExists) {
      return res.status(400).json({ message: 'Categoria já existe' });
    }

    // Criar categoria (sem user_id)
    const category = await Category.create({
      name
    });

    // Associar categoria ao usuário (tabela intermediária)
    await Category.addCategoryToUser(category.id, req.user.id);

    res.status(201).json(category);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter todas as categorias do usuário
exports.getCategories = async (req, res) => {
  try {
    // Agora busca através da tabela user_categories
    const categories = await Category.findByUserId(req.user.id);
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar categoria
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Verificar se a categoria pertence ao usuário (através da tabela intermediária)
    const belongsToUser = await Category.belongsToUser(req.params.id, req.user.id);
    if (!belongsToUser) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const category = await Category.update(req.params.id, name);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Deletar categoria
exports.deleteCategory = async (req, res) => {
  try {
    // Verificar se a categoria pertence ao usuário
    const belongsToUser = await Category.belongsToUser(req.params.id, req.user.id);
    if (!belongsToUser) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Não permitir deletar categorias padrão (verificar por nome)
    const category = await Category.findById(req.params.id);
    const defaultCategories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Outros'];
    
    if (defaultCategories.includes(category.name)) {
      return res.status(400).json({ message: 'Não é possível excluir categorias padrão' });
    }
    
    // Primeiro remover das associações de usuários
    await Category.removeCategoryFromAllUsers(req.params.id);
    
    // Depois deletar a categoria
    const deleted = await Category.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    res.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};