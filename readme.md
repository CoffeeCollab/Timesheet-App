# Timesheet App

The Timesheet App is a web application that allows employees to record their work shifts. The app is built using the following technologies:

- Front-end: HTML, CSS, JavaScript, and EJS
- Back-end: Node.js, Express.js, JWT, Bcrypt, and MongoDB

The main features of the app include:

- User registration: Employees can create an account by providing their SIN number, name, email, password, and phone number.
- Login: Employees can log in to their account using their email and password.
- Punch in: Employees can start their work shift
- Break in: Employees can take a break
- Break out: Employees can end their break
- Time out: Employees can end their work shift
- Calculation: The app calculates the total hours worked and stores the data in a MongoDB database

## Getting Started

### Prerequisites

What things you need to install the software and how to install them

- Node.js
- MongoDB

### Installing

1. Clone the repository:

```
git clone https://github.com/your-username/timesheet-app.git
```

2. Install the dependencies

```
cd timesheet-app
npm install
```

3. Create a `.env` file in the root directory of the project and add the following environment variables:

```
MONGODB_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-secret-key>
```

4. Start the application

## Built With:

- Node.js - JavaScript runtime
- Express.js - Web framework
- EJS - Embedded JavaScript templates
- MongoDB - NoSQL database
- JWT - JSON Web Tokens
- Bcrypt - Password hashing library

## Authors

- [Henrique Sagara](https://htsagara.github.io/henrique-sagara/) - **Backend developer**
- [Evrim Çifçi](https://evrimciftciportfolio.com/) - **Frontend developer**
- [Lucas Berna](https://github.com/lucasbernardo842) - **Frontend developer**
