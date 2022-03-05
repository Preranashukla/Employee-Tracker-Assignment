INSERT INTO department (department_name)
VALUES 
("Sales"),
("Engineering"),
("Finance"),
("Legal");

INSERT INTO employee_role (title, salary, department_id)
VALUES
("Sales Lead", 100000, 1),
("Salesperson", 80000, 1),
("Lead Engineer", 150000, 2),
("Software Engineer", 1200000, 2),
("Account Manger", 160000, 3),
("Accountant", 125000, 3),
("Legal Team Lead", 250000, 4),
("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Matt", "Dsenna", 1, null),
("Huy", "Vo", 2, 1),
("Lachlan", "Connell", 3, null),
("Clayton", "Mcintosh", 4, 3),
("Navpreet", "Ahuja", 5, null),
("Prab", "Singh", 6, 5),
("Michael", "Fabbro", 7, null),
("Chantress", "Rabski", 8, 7);