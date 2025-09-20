const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'seu_jwt_secreto', {
    expiresIn: '30d',
  });
};

// Registrar usuário
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Login usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se usuário existe
    const user = await User.findByEmail(email);

    if (user && (await User.comparePassword(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Email ou senha inválidos' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter perfil do usuário
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};