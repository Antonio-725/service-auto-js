
'use strict';

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    define: {
      freezeTableName: true // Ensures table names match model names exactly
    }
  }
);

// Test the connection (optional, for debugging)
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Call the initialization function (optional, uncomment for development)
// initializeDatabase();

module.exports = sequelize;