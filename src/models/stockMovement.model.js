import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import Product from "./product.model.js";
import Store from "./store.model.js";
import Supplier from "./supplier.model.js";
import Sequelize from "sequelize";
// const StockMovement = sequelize.define("StockMovement", {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     store_id: { type: DataTypes.INTEGER, references: { model: Store, key: "id" }, onDelete: "CASCADE" },
//     product_id: { type: DataTypes.INTEGER, references: { model: Product, key: "id" }, onDelete: "CASCADE" },
//     quantity: { type: DataTypes.INTEGER, allowNull: false },
//     movement_type: { type: DataTypes.ENUM("BUY", "SELL", "REMOVE"), allowNull: false }
//   }, { timestamps: true });
  
const StockMovement = sequelize.define("StockMovement", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE" },
  store_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Store, key: "id" }, onDelete: "CASCADE" },
  supplier_id: { type: DataTypes.INTEGER, references: { model: Supplier, key: "id" }, onDelete: "SET NULL" },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  movement_type: { type: DataTypes.ENUM("stock_in", "sale", "removal", "return_to_supplier"), allowNull: false },
  movement_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  purchase_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, // New column to track actual purchase price
  notes: { type: DataTypes.TEXT } // Can be used for return reasons
}, { timestamps: true })

  export default StockMovement