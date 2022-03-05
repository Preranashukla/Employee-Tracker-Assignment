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
    console.log('Connected to employeetracker_db.')
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
  
addEmployee = () => {
        inquirer.prompt([
          {
            type: 'input',
            name: 'fistname',
            message: "What is the employee's first name?",
          
          },
          {
          type: 'input',
          name: 'lastname',
          message: "What is the employees last name?"
        }
    ])
    .then (answer => {
        const params = [answer.firstname, answer.lastname]

        //get the roles from the employee_role table
        const rolesSql = `SELECT employee_role.id, employee_role.title from employee_role`;
        db.query(rolesSql, function (err, data) {
            if (err) throw err;

            const roles= data.map(({ id, title }) => ({ name: title, value: id}));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the new employee's role?",
                    choices: roles
                }
            ])
            .then(roleChoice => {
                const role = roleChoice.role;
                params.push(role);

                const managerSql = `Select * FROM employee`;

                db.query(managerSql, function (err, data) {
                    if (err) throw err;

                    const managers = data.map (({id, first_name, last_name}) => ({ name: first_name + " "+ last_name, value: id}));
                    inquirer.prompt([
                        {
                        type: 'list',
                        name: 'manager',
                        message: "Who is the new employee's manager?",
                        choices: managers
                    }
                ])
                    .then(managerChoice => {
                        const manager = managerChoice.manager;
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ?, ?)`;
                        ///need to fix this and find out why first name is coming up as null in values
                        db.query(sql, params, (err, result) => {
                            if (err) throw err;
                            console.log("Success! New employee has been added")

                            mainQuestions();
                        });
                    });
                });
            });
        });
    });
};

mainQuestions();