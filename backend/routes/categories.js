const express = require('express');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth); // Todas as rotas abaixo exigem autenticação

router.route('/')
  .post(createCategory)
  .get(getCategories);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

router.get('/available', async (req, res) => {
  try {
    const categories = await Category.findByUserId(req.user.id);
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;