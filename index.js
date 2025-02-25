import inquirer from 'inquirer';
import {
    getDepartments, getRoles, getEmployees, addDepartment, addRole, addEmployee, deleteEmployee, deleteRole, getManagers, modifyEmployee, getEmployeesByDepartmentId, deleteDepartment, getEmployeesByManagerId, getDepartmentBudget, getEmployeesWithNoManagerOption, getEmployeesByRoleId
} from './src/queries.js';

const displayWelcomeMessage = () => {
    console.log(`
    Welcome to the Employee Management System!
    -----------------------------------------`);
};

const displaySummaryTable = async () => {
    const [departments, employees, roles] = await Promise.all([getDepartments(), getEmployees(), getRoles()]);

    const employeeCountByDepartment = employees.reduce((acc, employee) => {
        const role = roles.find(role => role.id === employee.role_id);
        if (role) {
            acc[role.department_id] = (acc[role.department_id] || 0) + 1;
        }
        return acc;
    }, {});

    console.table([{ 'Total Departments': departments.length, 'Total Employees': employees.length }]);

    const rolesByDepartment = roles.reduce((acc, role) => {
        const departmentName = departments.find(dept => dept.id === role.department_id)?.name || 'Unknown';
        acc[departmentName] = acc[departmentName] || [];
        acc[departmentName].push(role.title);
        return acc;
    }, {});

    console.table(rolesByDepartment);
};

const promptUser = async () => {
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View All Departments', 'View All Roles', 'View All Employees', 'View Employees by Manager', 'View Employees by Department', 'View Department Budget',
            'Add Department', 'Add Role', 'Add Employee', 'Update Employee Role', 'Delete Employee', 'Delete Role', 'Delete Department', 'Exit'
        ]
    });

    switch (action) {
        case 'View All Departments': return viewAllDepartments();
        case 'View All Roles': return viewAllRoles();
        case 'View All Employees': return viewAllEmployees();
        case 'View Employees by Manager': return viewEmployeesByManager();
        case 'View Employees by Department': return viewEmployeesByDepartment();
        case 'View Department Budget': return viewDepartmentBudget();
        case 'Add Department': return confirmAction('Are you sure you want to add a new department?') && addNewDepartment();
        case 'Add Role': return confirmAction('Are you sure you want to add a new role?') && addNewRole();
        case 'Add Employee': return confirmAction('Are you sure you want to add a new employee?') && addNewEmployee();
        case 'Update Employee Role': return updateEmployeeRole();
        case 'Delete Employee': return confirmAction('Are you sure you want to delete an employee?') && removeEmployee();
        case 'Delete Role': return deleteRoleWithCheck();
        case 'Delete Department': return confirmAction('Are you sure you want to delete a department?') && removeDepartment();
        case 'Exit': console.log('Goodbye!'); process.exit();
    }
    promptUser();
};

const viewAllDepartments = async () => {
    const departments = await getDepartments();
    console.table(departments);
    promptUser();
};

const viewAllRoles = async () => {
    const roles = await getRoles();
    console.table(roles.map(role => ({
        ID: role.id, Title: role.title, Department: role.department_name, Salary: role.Salary
    })));
    promptUser();
};

const viewAllEmployees = async () => {
    const employees = await getEmployees();
    console.table(employees.map(employee => ({
        ID: employee.id, 'First Name': employee.first_name, 'Last Name': employee.last_name, Role: employee.role_title,
        Department: employee.department_name, Manager: employee.manager_name || 'None',
        Salary: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(employee.salary)
    })));
    promptUser();
};

const addNewDepartment = async () => {
    const { name } = await inquirer.prompt({
        type: 'input', name: 'name', message: 'Enter the name of the new department:'
    });
    await addDepartment(name);
    console.log(`Added new department: ${name}`);
    promptUser();
};

const addNewRole = async () => {
    const departments = await getDepartments();
    const { title, salary, department_id } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter the title of the new role:' },
        { type: 'input', name: 'salary', message: 'Enter the salary for the new role:' },
        {
            type: 'list', name: 'department_id', message: 'Select the department for the new role:',
            choices: departments.map(department => ({ name: department.name, value: department.id }))
        }
    ]);
    await addRole({ title, salary, department_id });
    console.log(`Added new role: ${title}`);
    promptUser();
};

const addNewEmployee = async () => {
    const [employees, roles] = await Promise.all([getEmployeesWithNoManagerOption(), getRoles()]);
    const answers = await inquirer.prompt([
        { type: 'input', name: 'first_name', message: 'Enter the first name of the new employee:' },
        { type: 'input', name: 'last_name', message: 'Enter the last name of the new employee:' },
        {
            type: 'list', name: 'role_id', message: 'Select the role for the new employee:',
            choices: roles.map(role => ({ name: `${role.title} (${role.department_name}) - ${role.formatted_salary}`, value: role.id }))
        },
        {
            type: 'list', name: 'manager_id', message: 'Select the manager for the new employee:',
            choices: employees.map(employee => ({ name: employee.name, value: employee.id }))
        }
    ]);
    await addEmployee(answers);
    console.log(`Added new employee: ${answers.first_name} ${answers.last_name}`);
    promptUser();
};

const updateEmployeeRole = async () => {
    const [employees, roles] = await Promise.all([getEmployees(), getRoles()]);
    const { employeeId } = await inquirer.prompt({
        type: 'list', name: 'employeeId', message: 'Select the employee to update:',
        choices: employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
    });

    const { roleId } = await inquirer.prompt({
        type: 'list', name: 'roleId', message: 'Select the new role for the employee (or leave unchanged):',
        choices: [{ name: 'Unchanged', value: null }, ...roles.map(role => ({ name: `${role.title} (${role.department_name}) - ${role.Salary}`, value: role.id }))]
    });

    const { managerId } = await inquirer.prompt({
        type: 'list', name: 'managerId', message: 'Select the new manager for the employee (or leave unchanged):',
        choices: [{ name: 'Unchanged', value: null }, ...employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))]
    });

    const updates = {};
    if (roleId !== null) updates.role_id = roleId;
    if (managerId !== null) updates.manager_id = managerId;

    if (Object.keys(updates).length > 0) {
        await modifyEmployee(employeeId, updates);
        console.log('Employee updated successfully.');
    } else {
        console.log('No changes made to the employee.');
    }
    promptUser();
};

const removeEmployee = async () => {
    const employees = await getEmployees();
    const { employee_id } = await inquirer.prompt({
        type: 'list', name: 'employee_id', message: 'Select the employee to remove:',
        choices: employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
    });
    await deleteEmployee(employee_id);
    console.log(`Removed employee`);
    promptUser();
};

const removeRole = async () => {
    const roles = await getRoles();
    const { role_id } = await inquirer.prompt({
        type: 'list', name: 'role_id', message: 'Select the role to remove:',
        choices: roles.map(role => ({ name: role.title, value: role.id }))
    });
    await deleteRole(role_id);
    console.log(`Removed role`);
    promptUser();
};

const removeDepartment = async () => {
    const departments = await getDepartments();
    const { department_id } = await inquirer.prompt({
        type: 'list', name: 'department_id', message: 'Select the department to remove:',
        choices: departments.map(department => ({ name: department.name, value: department.id }))
    });
    await deleteDepartment(department_id);
    console.log(`Removed department`);
    promptUser();
};

const viewEmployeesByManager = async () => {
    const managers = await getManagers();
    const { managerId } = await inquirer.prompt({
        type: 'list', name: 'managerId', message: 'Select the manager to view employees:',
        choices: managers.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id }))
    });

    const employees = await getEmployeesByManagerId(managerId);
    console.table(employees.map(employee => ({
        ID: employee.id, 'First Name': employee.first_name, 'Last Name': employee.last_name, Role: employee.role_title,
        Department: employee.department_name, Salary: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(employee.salary)
    })));
    promptUser();
};

const viewEmployeesByDepartment = async () => {
    const departments = await getDepartments();
    const { department_id } = await inquirer.prompt({
        type: 'list', name: 'department_id', message: 'Select the department to view employees:',
        choices: departments.map(department => ({ name: department.name, value: department.id }))
    });
    const employees = await getEmployeesByDepartmentId(department_id);
    console.table(employees);
    promptUser();
};

const viewDepartmentBudget = async () => {
    const departments = await getDepartments();
    const { department_id } = await inquirer.prompt({
        type: 'list', name: 'department_id', message: 'Select the department to view budget:',
        choices: departments.map(department => ({ name: department.name, value: department.id }))
    });
    const budget = await getDepartmentBudget(department_id);
    console.log(`Total utilized budget for department: ${budget}`);
    promptUser();
};

const confirmAction = async (message) => {
    const { confirm } = await inquirer.prompt({
        type: 'confirm', name: 'confirm', message: message, default: false
    });
    return confirm;
};

const deleteRoleWithCheck = async () => {
    const roles = await getRoles();
    const { roleId } = await inquirer.prompt({
        type: 'list', name: 'roleId', message: 'Select the role to remove:',
        choices: roles.map(role => ({ name: `${role.title} (${role.department_name}) - ${role.Salary}`, value: role.id }))
    });

    const employees = await getEmployeesByRoleId(roleId);
    if (employees.length > 0) {
        console.log('The following employees are associated with this role:');
        console.table(employees);

        const { action } = await inquirer.prompt({
            type: 'list', name: 'action', message: 'What would you like to do?',
            choices: ['Modify Employee Roles', 'Delete Employees', 'Cancel']
        });

        if (action === 'Modify Employee Roles') {
            for (const employee of employees) {
                const { newRoleId } = await inquirer.prompt({
                    type: 'list', name: 'newRoleId', message: `Select a new role for ${employee.first_name} ${employee.last_name}:`,
                    choices: roles.map(role => ({ name: `${role.title} (${role.department_name}) - ${role.Salary}`, value: role.id }))
                });
                await modifyEmployee(employee.id, { role_id: newRoleId });
            }
        } else if (action === 'Delete Employees') {
            for (const employee of employees) {
                await deleteEmployee(employee.id);
            }
        } else {
            return;
        }
    }

    await deleteRole(roleId);
    console.log('Role deleted successfully.');
    promptUser();
};

displayWelcomeMessage();
promptUser();
