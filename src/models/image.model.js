import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import Product from "./product.model.js";

const Image = sequelize.define("Image", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE" },
  image_url: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });

export default Image
