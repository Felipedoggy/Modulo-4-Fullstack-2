import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',  // Alterar de "category" para "category_id"
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      setError('Erro ao carregar despesas');
    }
  };

const fetchCategories = async () => {
  try {
    // Alterar de '/categories/available' para '/categories'
    const res = await api.get('/categories');
    setCategories(res.data);
  } catch (err) {
    setError('Erro ao carregar categorias');
    console.error('Erro detalhado:', err.response?.data);
  }
};

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Converter para número se for category_id ou amount
    let processedValue = value;
    if (name === 'category_id') {
      processedValue = value ? parseInt(value) : '';
    } else if (name === 'amount') {
      processedValue = value ? parseFloat(value) : '';
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar category_id
    if (!formData.category_id) {
      setError('Selecione uma categoria');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id)  // Garantir que é número
      };

      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
      });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar despesa');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount,
      date: expense.date.split('T')[0],
      category_id: expense.category_id,  // Usar category_id
    });
    setEditingId(expense.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      setError('Erro ao excluir despesa');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Gerenciar Despesas</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          Voltar
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label>Descrição</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Valor</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label>Data</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Categoria</label>
            <select
              name="category_id"  // Nome correto
              value={formData.category_id}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category_id: '',
              });
              setEditingId(null);
            }}
            style={styles.cancelButton}
          >
            Cancelar
          </button>
        )}
      </form>

      <div style={styles.expensesList}>
        <h2>Despesas</h2>
        {expenses.length === 0 ? (
          <p>Nenhuma despesa cadastrada.</p>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} style={styles.expenseItem}>
              <div style={styles.expenseInfo}>
                <h3>{expense.description}</h3>
                <p>{formatCurrency(expense.amount)}</p>
                <p>{formatDate(expense.date)}</p>
                <p>Categoria: {expense.category_name}</p>
              </div>
              <div style={styles.expenseActions}>
                <button
                  onClick={() => handleEdit(expense)}
                  style={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  style={styles.deleteButton}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#ffe6e6',
    borderRadius: '4px',
  },
  form: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  expensesList: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  expenseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #eee',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseActions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Expenses;