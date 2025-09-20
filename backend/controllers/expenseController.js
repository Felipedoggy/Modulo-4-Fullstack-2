const Expense = require('../models/Expense');
const Category = require('../models/Category');

// Criar despesa
exports.createExpense = async (req, res) => {
  try {
    const { description, amount, date, category_id } = req.body;

    console.log('Tentando criar despesa com categoria:', category_id, 'para usuário:', req.user.id);
    console.log('Dados recebidos:', { description, amount, date, category_id });
    console.log('Tipo do category_id:', typeof category_id);
    // Verificar se a categoria existe
    const category = await Category.findById(category_id);
    
    if (!category) {
      console.log('Categoria não encontrada:', category_id);
      return res.status(400).json({ message: 'Categoria não encontrada' });
    }

    // Verificar se o usuário tem acesso à categoria
    const hasAccess = await Category.belongsToUser(category_id, req.user.id);
    
    if (!hasAccess) {
      console.log('Usuário não tem acesso à categoria:', category_id);
      
      // Tentar associar a categoria ao usuário automaticamente
      try {
        await Category.addCategoryToUser(category_id, req.user.id);
        console.log('Categoria associada automaticamente ao usuário');
      } catch (assocError) {
        console.log('Erro ao associar categoria:', assocError);
        return res.status(400).json({ 
          message: 'Categoria não disponível para este usuário. Entre em contato com o administrador.' 
        });
      }
    }

    // Criar a despesa
    const expense = await Expense.create({
      description,
      amount,
      date,
      category_id,
      user_id: req.user.id,
    });

    console.log('Despesa criada com sucesso:', expense.id);
    res.status(201).json(expense);
    
  } catch (error) {
    console.error('Erro detalhado ao criar despesa:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Obter todas as despesas do usuário
exports.getExpenses = async (req, res) => {
  try {
    console.log('Buscando despesas para usuário:', req.user.id);
    const expenses = await Expense.findByUserId(req.user.id);
    res.json(expenses);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter despesa por ID
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    
    // Verificar se a despesa pertence ao usuário
    const belongsToUser = await Expense.belongsToUser(req.params.id, req.user.id);
    if (!belongsToUser) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Erro ao buscar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Atualizar despesa
exports.updateExpense = async (req, res) => {
  try {
    const { description, amount, date, category_id } = req.body;
    
    // Verificar se a despesa pertence ao usuário
    const belongsToUser = await Expense.belongsToUser(req.params.id, req.user.id);
    if (!belongsToUser) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Verificar se a nova categoria é válida para o usuário
    const hasAccess = await Category.belongsToUser(category_id, req.user.id);
    if (!hasAccess) {
      return res.status(400).json({ message: 'Categoria não disponível para este usuário' });
    }

    const expense = await Expense.update(req.params.id, {
      description,
      amount,
      date,
      category_id
    });

    res.json(expense);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


// Deletar despesa
exports.deleteExpense = async (req, res) => {
  try {
    // Verificar se a despesa pertence ao usuário
    const belongsToUser = await Expense.belongsToUser(req.params.id, req.user.id);
    if (!belongsToUser) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const deleted = await Expense.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }
    
    res.json({ message: 'Despesa removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
  
};

