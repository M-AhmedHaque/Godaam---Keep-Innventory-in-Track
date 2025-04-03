import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

const Supplier = sequelize.define("Supplier", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  contact_info: { type: DataTypes.TEXT }
}, { timestamps: true });

export default Supplier