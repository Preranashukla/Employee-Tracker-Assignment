const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    console.log('Connected to employeetracker_db database.')
);


const mainQuestions = () => {
    inquirer.prompt ([
        {
            type: 'list',
            name: 'mainquestions',
            message: 'what would you like to do?',
            choices: [ 'View All Employees',
                        'Add Employee',
                        'Update Employee Role',
                        'View All Roles',
                        'Add Role',
                        'View All Departments',
                        'Add Department'
            ]
        }
    ]).then((answer) => {
        switch (answer.mainquestions) {
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateRole();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'Add Roles':
                addRole();
                break;
            case 'View All Departments':
                ViewAllDepartments();
                break;
            case 'Add Department':
                addDeparment();
                break;
        }
    });
}

viewAllEmployees = () => {
    console.log('Showing all employees...\n'); 
    db.query("SELECT employee.id, employee.first_name, employee.last_name, employee_role.title, department.department_name AS department, employee_role.salary,CONCAT (manager.first_name, ' ', manager.last_name) AS manager FROM employee  LEFT JOIN employee_role ON employee.role_id = employee_role.id LEFT JOIN department ON employee_role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id", function (err, res) {
        if (err) throw err;
        console.table(res);
        mainQuestions();
            });
    }
  

    
  
mainQuestions();