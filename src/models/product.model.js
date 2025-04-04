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
Product.addHook("afterCreate", async (product) => {
  await AuditLog.create({
    entity_type: "Product",
    entity_id: product.id,
    action: "CREATE",
    user_id: 1, // Assign based on authenticated user
    new_value: product.toJSON(),
  });
});

Product.addHook("beforeUpdate", async (product) => {
  const oldProduct = await Product.findByPk(product.id);
  await AuditLog.create({
    entity_type: "Product",
    entity_id: product.id,
    action: "UPDATE",
    user_id: 1, // Assign based on authenticated user
    old_value: oldProduct.toJSON(),
    new_value: product.toJSON(),
  });
});

export default Product


