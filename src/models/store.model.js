import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import User from "./user.model.js";

// const Store = sequelize.define("Store", {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     name: { type: DataTypes.STRING, allowNull: false },
//     owner_id: { type: DataTypes.INTEGER, references: { model: User, key: "id" }, onDelete: "CASCADE" }
//   }, { timestamps: true });
const Store = sequelize.define("Store", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT }
}, { timestamps: true });

export default Store;
