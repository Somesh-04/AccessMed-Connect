-- Create database (run in psql shell)
CREATE DATABASE reception_db;

-- Connect to database
\c reception_db;

-- Employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Dependents table
CREATE TABLE dependents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE
);

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Doctors table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL
);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_type VARCHAR(20) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL
);
