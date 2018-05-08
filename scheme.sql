DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE  bamazon_db;

CREATE TABLE products(
item_id INT NOT NULL,
product_name varchar(200) not null, 
department_name varchar(200) not null,
price INT NOT NULL,
stock_quantity INT NOT NULL,
product_sales INT NOT NULL,
PRIMARY KEY (item_id)
);

select * from products;

CREATE TABLE departments(
department_id INT NOT NULL,
department_name varchar(200) NOT NULL,
over_head_costs INT NOT NULL,
PRIMARY KEY (department_id)
);

select * from departments;

