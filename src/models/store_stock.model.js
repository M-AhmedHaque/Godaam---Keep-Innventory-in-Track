import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import Product from "./product.model.js";
import Store from "./store.model.js";
import Sequelize from "sequelize";
import Supplier from "./supplier.model.js";

const StoreStock = sequelize.define("StoreStock", {
  store_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Store, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Supplier, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  last_updated: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

StoreStock.addHook("beforeUpdate", async (storeStock) => {
  const oldStock = await StoreStock.findOne({
    where: { product_id: storeStock.product_id, store_id: storeStock.store_id },
  });

  await AuditLog.create({
    entity_type: "StoreStock",
    entity_id: storeStock.product_id,
    action: "UPDATE",
    user_id: 1,
    old_value: oldStock.toJSON(),
    new_value: storeStock.toJSON(),
  });
});

export default StoreStock