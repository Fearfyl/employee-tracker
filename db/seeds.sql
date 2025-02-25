-- Insert initial data into department table
INSERT INTO department (name) 
VALUES 
    ('Engineering'), 
    ('Sales'), 
    ('Finance');

-- Insert initial data into role table
INSERT INTO role (title, salary, department_id) 
VALUES 
    ('Software Engineer', 80000, 1),
    ('Sales Manager', 60000, 2),
    ('Accountant', 70000, 3);

-- Insert initial data into employee table
INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES 
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, NULL),
    ('Mike', 'Johnson', 3, NULL);