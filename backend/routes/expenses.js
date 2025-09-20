const express = require('express');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth); // Todas as rotas abaixo exigem autenticação

router.route('/')
  .post(createExpense)
  .get(getExpenses);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;