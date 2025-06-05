-- Crear tablas
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  hashed_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  result TEXT NOT NULL,
  file_name TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos dummy
INSERT INTO users (username, email, hashed_password) VALUES
('admin', 'admin@example.com', 'adminhash'),
('usuario1', 'u1@mail.com', 'hash1'),
('usuario2', 'u2@mail.com', 'hash2');

INSERT INTO predictions (user_id, result, file_name) VALUES
(1, 'maíz', 'dataset1.csv'),
(2, 'trigo', 'dataset2.csv');

INSERT INTO activity_logs (user_id, action) VALUES
(1, 'login'),
(1, 'predicción realizada'),
(2, 'login');
