-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                  
    workos_user_id VARCHAR(255) UNIQUE,   
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de predicciones
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    input_source VARCHAR(10) NOT NULL, -- 'csv' o 'manual'
    file_name VARCHAR(255),
    crop_result VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs de actividad
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'login', 'predict', 'logout'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_sessions (
    id SERIAL PRIMARY KEY,                          -- Unique identifier for this session record in your DB
    user_id INTEGER NOT NULL,                       -- Foreign key to your local 'users' table's 'id'
    
    workos_user_id VARCHAR(255) NOT NULL,           -- The WorkOS user ID ('sub' claim from JWT)
                                                    -- Good for quick correlation without joining 'users' table every time
                                                    -- You might want an index on this if you look up sessions by workos_user_id often.

    workos_session_id VARCHAR(255) UNIQUE NOT NULL, -- The WorkOS session ID ('sid' claim from JWT)
                                                    -- This is useful for logout operations with WorkOS.
                                                    -- Making it UNIQUE assumes one active app_session record per WorkOS session.

    encrypted_refresh_token TEXT NOT NULL,          -- The WorkOS refresh token. 
                                                    -- IMPORTANT: This should be ENCRYPTED by your application before storing it.
                                                    -- The 'TEXT' type can hold the encrypted string.

    ip_address VARCHAR(45),                         -- IP address of the user when this session/token was established/refreshed (for auditing)
    user_agent TEXT,                                -- User agent string of the client (for auditing)

    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When this set of tokens (especially refresh token) was issued by WorkOS
    
    -- How you manage 'expires_at' depends on WorkOS's session policies:
    -- 1. Max session length: The absolute time the entire WorkOS session will expire.
    -- 2. Inactivity timeout: The time the session expires if no refresh has occurred.
    -- You might store the more conservative of these, or manage based on your app's logic.
    -- This example assumes a general expiry for the refresh token's validity or the session.
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When this record was created in your DB
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When this record was last updated (e.g., refresh token rotated)

    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE -- If a user is deleted, their sessions are also deleted.
);

--Datos dummy usr:

INSERT INTO users (email, workos_user_id, full_name, is_active)
VALUES
('maria-elenazapata@alcala-menendez.com', NULL, 'Diego Angélica Vélez Girón', true),
('rebecamena@grupo.net', NULL, 'Fabiola Hernán Córdova', true),
('itzelmartinez@corporacin.com', NULL, 'Irene Lorenzo Olvera', true),
('ggurule@club.net', NULL, 'Amelia Fidel Galván', true),
('pulidosusana@anaya-espinosa.com', NULL, 'Abigail Villanueva Ponce', true),
('ramon54@proyectos.com', NULL, 'Lic. Miriam Casillas', true),
('vanguiano@gmail.com', NULL, 'Timoteo Guerrero Enríquez', true),
('uriasandres@laboratorios.com', NULL, 'Catalina Soria Ontiveros', true),
('maciasrenato@hotmail.com', NULL, 'Héctor Romero Urías', true),
('wharo@gmail.com', NULL, 'Dr. Bernardo Casares', true),
('melendezeugenia@industrias.com', NULL, 'Cristal Raya Arguello', true),
('herediaabelardo@gmail.com', NULL, 'Cynthia Marcos Figueroa', true),
('alfonsomarquez@rivero-mondragon.net', NULL, 'Elvira Malave Becerra', false),
('indira01@vaca-reynoso.net', NULL, 'Elvira Madrid', false),
('dianavelez@sarabia-rocha.net', NULL, 'Omar Gaitán Reynoso', true),
('vigilignacio@hotmail.com', NULL, 'Adán Santana', true),
('alejandro70@despacho.info', NULL, 'Estefanía Villa Madrid', true),
('gregorio34@yahoo.com', NULL, 'Mtro. Jacinto Camacho', true),
('juanreynoso@bueno.com', NULL, 'Marcela Mata', true),
('uribeisrael@yahoo.com', NULL, 'Francisco Javier Vicente Benítez', false);

--Dummy Predictions:

INSERT INTO predictions (user_id, crop_result, file_name, input_source) VALUES
(1, 'maíz', 'dataset1_1.csv', 'csv'),
(2, 'cebada', 'dataset2_1.csv', 'csv'),
(3, 'frijol', 'dataset3_1.csv', 'csv'),
(4, 'arroz', 'dataset4_1.csv', 'csv'),
(5, 'sorgo', 'dataset5_1.csv', 'csv'),
(6, 'arroz', 'dataset6_1.csv', 'csv'),
(7, 'arroz', 'dataset7_1.csv', 'csv'),
(8, 'cebada', 'dataset8_1.csv', 'csv'),
(9, 'maíz', 'dataset9_1.csv', 'csv'),
(9, 'cebada', 'dataset9_2.csv', 'csv'),
(10, 'cebada', 'dataset10_1.csv', 'csv'),
(10, 'maíz', 'dataset10_2.csv', 'csv'),
(11, 'trigo', 'dataset11_1.csv', 'csv'),
(11, 'trigo', 'dataset11_2.csv', 'csv'),
(12, 'frijol', 'dataset12_1.csv', 'csv'),
(12, 'cebada', 'dataset12_2.csv', 'csv'),
(13, 'trigo', 'dataset13_1.csv', 'csv'),
(13, 'sorgo', 'dataset13_2.csv', 'csv'),
(14, 'maíz', 'dataset14_1.csv', 'csv'),
(14, 'arroz', 'dataset14_2.csv', 'csv'),
(15, 'maíz', 'dataset15_1.csv', 'csv'),
(15, 'arroz', 'dataset15_2.csv', 'csv'),
(15, 'trigo', 'dataset15_3.csv', 'csv'),
(16, 'cebada', 'dataset16_1.csv', 'csv'),
(16, 'frijol', 'dataset16_2.csv', 'csv'),
(16, 'maíz', 'dataset16_3.csv', 'csv'),
(17, 'maíz', 'dataset17_1.csv', 'csv'),
(17, 'cebada', 'dataset17_2.csv', 'csv'),
(17, 'trigo', 'dataset17_3.csv', 'csv'),
(18, 'trigo', 'dataset18_1.csv', 'csv'),
(18, 'maíz', 'dataset18_2.csv', 'csv'),
(18, 'cebada', 'dataset18_3.csv', 'csv'),
(19, 'cebada', 'dataset19_1.csv', 'csv'),
(19, 'sorgo', 'dataset19_2.csv', 'csv'),
(19, 'maíz', 'dataset19_3.csv', 'csv'),
(20, 'arroz', 'dataset20_1.csv', 'csv'),
(20, 'frijol', 'dataset20_2.csv', 'csv'),
(20, 'maíz', 'dataset20_3.csv', 'csv');

--dummy Activity Logs:

INSERT INTO activity_logs (user_id, action) VALUES
(1, 'login'), (1, 'predict'), (1, 'logout'),
(2, 'login'), (2, 'predict'), (2, 'logout'),
(3, 'login'), (3, 'predict'), (3, 'logout'),
(4, 'login'), (4, 'predict'), (4, 'logout'),
(5, 'login'), (5, 'predict'), (5, 'logout'),
(6, 'login'), (6, 'predict'), (6, 'logout'),
(7, 'login'), (7, 'predict'), (7, 'logout'),
(8, 'login'), (8, 'predict'), (8, 'logout'),
(9, 'login'), (9, 'predict'), (9, 'logout'),
(10, 'login'), (10, 'predict'), (10, 'logout'),
(11, 'login'), (11, 'predict'),
(12, 'login'), (12, 'predict'),
(13, 'login'), (13, 'predict'),
(14, 'login'), (14, 'predict'),
(15, 'login'), (15, 'predict'),
(16, 'login'),
(17, 'login'),
(18, 'login'),
(19, 'login'),
(20, 'login');
