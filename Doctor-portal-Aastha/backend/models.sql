CREATE DATABASE doctor_portal;

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    age INT,
    blood VARCHAR(5),
    condition VARCHAR(100)
);

INSERT INTO patients VALUES
(1, 'Ms. R', 44, 'O+', 'Hypertension'),
(2, 'Mr. A', 52, 'B+', 'Diabetes');
