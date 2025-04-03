import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import Product from "./product.model.js";
import Store from "./store.model.js";
import Sequelize from "sequelize";
import Supplier from "./supplier.model.js";
// const Stock = sequelize.define("Stock", {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     store_id: { type: DataTypes.INTEGER, references: { model: Store, key: "id" }, onDelete: "CASCADE" },
//     product_id: { type: DataTypes.INTEGER, references: { model: Product, key: "id" }, onDelete: "CASCADE" },
//     quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
//   }, { timestamps: true, indexes: [{ unique: true, fields: ["store_id", "product_id"] }] });
const StoreStock = sequelize.define("StoreStock", {
  store_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Store, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Supplier, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  last_updated: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

export default StoreStock