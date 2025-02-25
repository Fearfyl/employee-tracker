import pool from './connection.js'; // Adjust the import according to your project structure

// Fetch all departments from the database
export const getDepartments = async () => {
    const { rows } = await pool.query('SELECT * FROM department');
    return rows;
};

// Fetch all roles from the database
export const getRoles = async () => {
    const query = `
        SELECT r.id, r.title, d.name AS department_name,
                     to_char(r.salary, 'FM$999,999,999.00') AS "Salary"
        FROM role r
        JOIN department d ON r.department_id = d.id
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// Fetch all employees from the database with manager names and salaries
export const getEmployees = async () => {
    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title AS role_title, r.salary, d.name AS department_name, 
                     CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// Fetch only managers from the database
export const getManagers = async () => {
    const query = `
        SELECT DISTINCT e.id, e.first_name, e.last_name
        FROM employee e
        JOIN employee m ON e.id = m.manager_id
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// Fetch detailed employee information
export const getEmployeeDetails = async () => {
    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title AS role_title, r.salary, d.name AS department_name, 
                     CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// Fetch detailed role information
export const getRoleDetails = async () => {
    const query = `
        SELECT r.id, r.title, r.salary, d.name AS department_name
        FROM role r
        JOIN department d ON r.department_id = d.id
    `;
    const { rows } = await pool.query(query);

    // Format the salary for each role
    return rows.map(role => ({
        ...role,
        salary: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(role.salary)
    }));
};

// Fetch employees by department ID from the database
export const getEmployeesByDepartmentId = async (departmentId) => {
    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title AS role_title, r.salary, d.name AS department_name, 
                     CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
        WHERE d.id = $1
    `;
    const { rows } = await pool.query(query, [departmentId]);
    return rows;
};

// Add a new department to the database
export const addDepartment = async (name) => {
    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
};

// Add a new role to the database
export const addRole = async (title, salary, department_id) => {
    await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
};

// Add a new employee to the database
export const addEmployee = async (employee) => {
    const { first_name, last_name, role_id, manager_id } = employee;
    const truncatedFirstName = first_name.length > 30 ? first_name.substring(0, 30) : first_name;
    const truncatedLastName = last_name.length > 30 ? first_name.substring(0, 30) : last_name;
    const query = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [truncatedFirstName, truncatedLastName, role_id, manager_id];
    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (err) {
        console.error('Error adding employee:', err);
        throw err;
    }
};

// Fetch employees by role ID from the database
export const getEmployeesByRoleId = async (roleId) => {
    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title AS role_title, d.name AS department_name
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        WHERE e.role_id = $1
    `;
    const { rows } = await pool.query(query, [roleId]);
    return rows;
};

// Fetch employees by manager ID from the database
export const getEmployeesByManagerId = async (managerId) => {
    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title AS role_title, r.salary, d.name AS department_name
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        WHERE e.manager_id = $1
    `;
    const { rows } = await pool.query(query, [managerId]);
    return rows;
};

// Modify an employee's details
export const modifyEmployee = async (employeeId, updates) => {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = [...Object.values(updates), employeeId];

    const query = `
        UPDATE employee
        SET ${setClause}
        WHERE id = $${values.length}
    `;
    await pool.query(query, values);
};

// Delete an employee from the database
export const deleteEmployee = async (employeeId) => {
    // Set manager_id to null for employees who reference this employee as their manager
    await pool.query('UPDATE employee SET manager_id = NULL WHERE manager_id = $1', [employeeId]);
    // Delete the employee
    await pool.query('DELETE FROM employee WHERE id = $1', [employeeId]);
};

// Delete a role from the database
export const deleteRole = async (roleId) => {
    await pool.query('DELETE FROM role WHERE id = $1', [roleId]);
};

// Delete a department from the database
export const deleteDepartment = async (departmentId) => {
    await pool.query('DELETE FROM department WHERE id = $1', [departmentId]);
};

// Fetch the total budget of a department
export const getDepartmentBudget = async (departmentId) => {
    const query = `
        SELECT SUM(r.salary) AS total_budget
        FROM employee e
        JOIN role r ON e.role_id = r.id
        WHERE r.department_id = $1
    `;
    const { rows } = await pool.query(query, [departmentId]);
    const totalBudget = rows[0].total_budget;

    // Format the total budget
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBudget);
};

// Fetch all employees with a "No Manager" option
export const getEmployeesWithNoManagerOption = async () => {
    const query = `
        SELECT id, CONCAT(first_name, ' ', last_name) AS name
        FROM employee
    `;
    const { rows } = await pool.query(query);
    rows.unshift({ id: null, name: 'No Manager' });
    return rows;
};
