import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import Supplier from "./supplier.model.js";
import Product from "./product.model.js";

const SupplierProduct = sequelize.define("SupplierProduct", {
  supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Supplier, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM("available", "unavailable"), defaultValue: "available" }
}, { timestamps: true });
export default SupplierProduct