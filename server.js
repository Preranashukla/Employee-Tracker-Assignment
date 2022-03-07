const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

const db = mysql.createConnection(
  {
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  console.log("Connected to employeetracker_db.")
);

//inquirer prompt to ask questions about what the user would like to do
const mainQuestions = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "mainquestions",
        message: "what would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
        ],
      },
    ])
    .then((answer) => {
      switch (answer.mainquestions) {
        case "View All Employees":
          viewAllEmployees();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateRole();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "Add Role":
          addRole();
          break;
        case "View All Departments":
          viewAllDepartments();
          break;
        case "Add Department":
          addDepartment();
          break;
      }
    });
};
//funtion to view all employees
viewAllEmployees = () => {
  console.log("Showing all employees...\n");
  db.query(
    "SELECT employee.id, employee.first_name, employee.last_name, employee_role.title, department.department_name AS department, employee_role.salary,CONCAT (manager.first_name, ' ', manager.last_name) AS manager FROM employee  LEFT JOIN employee_role ON employee.role_id = employee_role.id LEFT JOIN department ON employee_role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      mainQuestions();
    }
  );
};
//function to add a new employee
addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstname",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "lastname",
        message: "What is the employees last name?",
      },
    ])
    .then((answer) => {
      console.log(answer.firstname);
      const params = [answer.firstname, answer.lastname];
      //console.log(params)
      //get the roles from the employee_role table
      const rolesSql = `SELECT employee_role.id, employee_role.title from employee_role`;
      db.query(rolesSql, function (err, data) {
        if (err) throw err;

        const roles = data.map(({ id, title }) => ({ name: title, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the new employee's role?",
              choices: roles,
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role;
            params.push(role);

            const managerSql = `Select * FROM employee`;

            db.query(managerSql, function (err, data) {
              if (err) throw err;

              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the new employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerChoice) => {
                  const manager = managerChoice.manager;
                  params.push(manager);
                  // console.log(params);
                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ?, ?)`;

                  db.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Success! New employee has been added");
                    viewAllEmployees();
                    mainQuestions();
                  });
                });
            });
          });
      });
    });
};
//function to update employee role
updateRole = () => {
  const employeeSQL = `SELECT * FROM employee`;

  db.query(employeeSQL, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee's role would you like to update?",
          choices: employees,
        },
      ])
      .then((chosenEmployee) => {
        const employee = chosenEmployee.name;
        const params = [];
        params.push(employee);

        const updateroleSql = `SELECT * FROM employee_role`;

        db.query(updateroleSql, (err, data) => {
          if (err) throw err;

          const roles = data.map(({ id, title }) => ({
            name: title,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's new role?",
                choices: roles,
              },
            ])
            .then((chosenRole) => {
              const role = chosenRole.role;
              params.push(role);

              let employee = params[0];
              params[0] = role;
              params[1] = employee;

              const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

              db.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee role has been updated!");

                viewAllEmployees();
                mainQuestions();
              });
            });
        });
      });
  });
};

//function to view all role types
viewAllRoles = () => {
  console.log("Showing all roles...\n");
  db.query(
    `SELECT employee_role.id, employee_role.title, department.department_name AS department FROM employee_role INNER JOIN department ON employee_role.department_id = department.id`,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      mainQuestions();
    }
  );
};

//function to add a new role
addRole = () => {
  //console.log("GETTING TO ADDROLE FUNCTION TEST")
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "What is the name of the role you would like to create?",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of this new role?",
      },
    ])
    .then((answer) => {
      const params = [answer.role, answer.salary];

      //get user to select which department the role is in from the
      //list of deparments in the deparment table
      const roleSQL = `SELECT department_name, id FROM department`;

      db.query(roleSQL, (err, data) => {
        if (err) throw err;

        const departments = data.map(({ department_name, id }) => ({
          name: department_name,
          value: id,
        }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "dept",
              message: "What department is the new role in?",
              choices: departments,
            },
          ])
          .then((chosenDept) => {
            const dept = chosenDept.dept;
            //console.log(dept);
            params.push(dept);
            //console.log(params);
            const sql = `INSERT INTO employee_role (title, salary, department_id)
                VALUES (?, ?, ?)`;

            db.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log("Added " + answer.role + " to roles!");

              viewAllRoles();
            });
          });
      });
    });
};

//function to view all departments
viewAllDepartments = () => {
  console.log("Showing all departments...\n");
  db.query(
    `SELECT department.id AS id, department.department_name AS department FROM department`,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      mainQuestions();
    }
  );
};

//function to add a new department
addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDept",
        message:
          "What is the name of the new department you would like to add?",
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO department (department_name)
        VALUES (?)`;

      db.query(sql, answer.newDept, (err, res) => {
        if (err) throw err;
        console.log("Added " + answer.newDept + " to departments");
        viewAllDepartments();
        mainQuestions();
      });
    });
};
mainQuestions();
