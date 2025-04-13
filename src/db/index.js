import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();
const sequelize = new Sequelize({
  dialect: 'postgres',
  replication: {
    read: [
      {
        host: 'localhost',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
    ],
    write: {
        host: 'localhost',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
  },
  pool: {
    max: 10,
    idle: 30000,
  },
  logging: console.log,
});

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

export default sequelize

