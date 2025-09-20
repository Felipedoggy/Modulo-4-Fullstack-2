-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS finance_app;
USE finance_app;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de categorias (GLOBAL - sem user_id)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela intermediária para relacionamento M:N (usuário-categoria)
CREATE TABLE IF NOT EXISTS user_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, category_id)
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  category_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserir categorias padrão
INSERT IGNORE INTO categories (name) VALUES
('Alimentação'),
('Transporte'),
('Moradia'),
('Saúde'),
('Educação'),
('Lazer'),
('Outros');

-- Inserir tags padrão (opcional - para demonstração M:N adicional)
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#007bff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expense_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_expense_tag (expense_id, tag_id)
);

-- Inserir tags padrão
INSERT IGNORE INTO tags (name, color) VALUES
('urgente', '#dc3545'),
('importante', '#ffc107'),
('pessoal', '#007bff'),
('trabalho', '#28a745'),
('mensal', '#6f42c1');

-- Procedimento para associar automaticamente categorias a novos usuários
DELIMITER $$

CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  -- Associar todas as categorias padrão ao novo usuário
  INSERT INTO user_categories (user_id, category_id)
  SELECT NEW.id, id FROM categories;
END$$

DELIMITER ;

-- Visualização para mostrar usuários e suas categorias
CREATE VIEW user_categories_view AS
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email,
  c.id as category_id,
  c.name as category_name,
  uc.created_at as associated_at
FROM users u
JOIN user_categories uc ON u.id = uc.user_id
JOIN categories c ON c.id = uc.category_id
ORDER BY u.name, c.name;

-- Visualização para mostrar despesas com detalhes
CREATE VIEW expense_details_view AS
SELECT 
  e.id,
  e.description,
  e.amount,
  e.date,
  u.name as user_name,
  c.name as category_name,
  e.created_at
FROM expenses e
JOIN users u ON e.user_id = u.id
JOIN categories c ON e.category_id = c.id
ORDER BY e.date DESC, e.created_at DESC;