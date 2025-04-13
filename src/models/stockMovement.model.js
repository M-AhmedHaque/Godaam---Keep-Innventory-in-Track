import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import Product from "./product.model.js";
import Store from "./store.model.js";
import Supplier from "./supplier.model.js";
import Sequelize from "sequelize";

const StockMovement = sequelize.define("StockMovement", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE" },
  store_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Store, key: "id" }, onDelete: "CASCADE" },
  supplier_id: { type: DataTypes.INTEGER, references: { model: Supplier, key: "id" }, onDelete: "SET NULL" },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  movement_type: { type: DataTypes.ENUM("stock_in", "sale", "removal", "return_to_supplier"), allowNull: false },
  movement_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  purchase_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  notes: { type: DataTypes.TEXT }
}, { timestamps: true })

StockMovement.addHook("afterCreate", async (stockMovement, options) => {
  await AuditLog.create({
    entity_type: "StockMovement",
    entity_id: stockMovement.id,
    action: "CREATE",
    user_id: stockMovement.user_id,
    new_value: stockMovement.toJSON(),
  });
});

StockMovement.addHook("beforeUpdate", async (stockMovement, options) => {
  const oldStock = await StockMovement.findByPk(stockMovement.id);
  await AuditLog.create({
    entity_type: "StockMovement",
    entity_id: stockMovement.id,
    action: "UPDATE",
    user_id: stockMovement.user_id,
    old_value: oldStock.toJSON(),
    new_value: stockMovement.toJSON(),
  });
});

StockMovement.addHook("beforeDestroy", async (stockMovement, options) => {
  await AuditLog.create({
    entity_type: "StockMovement",
    entity_id: stockMovement.id,
    action: "DELETE",
    user_id: stockMovement.user_id,
    old_value: stockMovement.toJSON(),
  });
});


  export default StockMovement