import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";

// const Product = sequelize.define("Product", {
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     name: { type: DataTypes.STRING, allowNull: false },
//     description: { type: DataTypes.TEXT },
//     price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
//   }, { timestamps: true }); 
const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  // sku: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM("active", "discontinued"), defaultValue: "active" }
}, { timestamps: true });

export default Product


