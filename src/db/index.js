// const { Sequelize } = require("sequelize");
import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

export default sequelize

// import dotenv from "dotenv";
// import pkg from "pg"; 
// const { Pool } = pkg; 

// dotenv.config();

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
// });

// pool.connect()
//     .then(() => console.log("Connected to PostgreSQL"))
//     .catch(err => console.error("Connection error", err));

// export { pool };
