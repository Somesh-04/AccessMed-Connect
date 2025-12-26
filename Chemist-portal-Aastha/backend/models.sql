CREATE DATABASE dispensary_db;

CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    stock INT,
    threshold INT DEFAULT 20
);

INSERT INTO medicines (name, stock) VALUES
('Paracetamol 500mg', 120),
('Amoxicillin', 45),
('Metformin', 32),
('Amlodipine', 18),
('Insulin', 5),
('ORS Sachets', 10);
