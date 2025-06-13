require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: 3306
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
};







// {
//   "development": {
//     "username": "root",
//     "password": "@Antonio725",
//     "database": "autoservice",
//     "host": "127.0.0.1",
//     "dialect": "mysql",
//     "port": 3306
//   },
//   "test": {
//     "username": "root",
//     "password": null,
//     "database": "autoservice",
//     "host": "127.0.0.1",
//     "dialect": "mysql"
//   },
//   "production": {
//     "username": "root",
//     "password": null,
//     "database": "autoservice",
//     "host": "127.0.0.1",
//     "dialect": "mysql"
//   }
// }
