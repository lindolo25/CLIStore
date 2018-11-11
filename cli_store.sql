DROP DATABASE IF EXISTS cli_store;

CREATE DATABASE cli_store;

USE cli_store;

/* Departments table ----------------------------------------------------------------------------------- */

CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(255) NOT NULL,
    over_head_costs DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
    VALUES 
    ('Electronics', 1234),
    ('Grocery', 597),
    ('Clothing', 324);

/* Products table -------------------------------------------------------------------------------------- */

CREATE TABLE products (
    product_id INT NOT NULL AUTO_INCREMENT,
    department_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sale DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT(11) NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id)
);

INSERT INTO products (product_name, department_id, price, stock_quantity)
    VALUES 
    ('TV', 1, 599.99, 5),
    ('Vegetables Mix', 2, 10.10, 100),
    ('phone', 1, 999.99, 155),
    ('Salmon', 2, 24.35, 75),
    ('Shirt', 3, 12.50, 50),
    ('Pant', 3, 36.40, 210),
    ('Computer', 1, 399.98, 85),
    ('Shoe', 3, 55.00, 123);