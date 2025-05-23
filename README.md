# 🧑‍💼 Employee Tracker

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen.svg)](https://nodejs.org/)
[![Made With](https://img.shields.io/badge/Made%20With-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Status](https://img.shields.io/badge/Status-Complete-success.svg)]()

A command-line application for managing a company's employee database. This tool allows users to view, add, update, and delete employees, roles, and departments using a MySQL database.

---

## 📸 Demo

![Employee Tracker CLI Screenshot](assets/demo.gif)

---

## 🚀 Features

- View all employees, roles, and departments  
- Add new employees, roles, and departments  
- Update employee roles  
- Delete employees, roles, or departments  
- Simple and intuitive CLI interface  

---

## 🧰 Technologies Used

- Node.js  
- Inquirer.js  
- MySQL2  
- console.table  
- JavaScript (ES6+)  
- dotenv  

---

## 📁 Directory Structure

```
employee-tracker/
├── db/
│   ├── schema.sql
│   └── seeds.sql
├── lib/
│   └── queries.js
├── assets/
│   └── demo.gif
├── index.js
├── package.json
├── .env
└── README.md
```

---

## ⚙️ Installation

1. **Clone the Repository**
```
git clone https://github.com/Fearfyl/employee-tracker.git
cd employee-tracker
```

2. **Install Dependencies**
```
npm install
```

3. **Set Up MySQL Database**
- Create a `.env` file in the root directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=employee_db
```

- Log into MySQL and run:
```
SOURCE db/schema.sql;
SOURCE db/seeds.sql;
```

4. **Run the Application**
```
node index.js
```

---

## 📝 Usage

After starting the app with `node index.js`, you will be presented with a list of actions in the terminal. Use the arrow keys to navigate and select the desired operation (e.g., view all employees, add a role, update an employee's role, etc.).

---

## 📌 Example Prompts

```
? What would you like to do? (Use arrow keys)
> View All Employees
  Add Employee
  Update Employee Role
  View All Roles
  Add Role
  View All Departments
  Add Department
  Quit
```

---

## 👥 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository  
2. Create your feature branch (`git checkout -b feature/yourFeature`)  
3. Commit your changes (`git commit -m 'Add your feature'`)  
4. Push to the branch (`git push origin feature/yourFeature`)  
5. Open a pull request  

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgments

- Thanks to the creators of [Inquirer.js](https://www.npmjs.com/package/inquirer) and [MySQL2](https://www.npmjs.com/package/mysql2)  
- Inspired by real-world HRIS (Human Resource Information Systems)  

---

## 🔗 Connect

Made with ❤️ by [@Fearfyl](https://github.com/Fearfyl)


