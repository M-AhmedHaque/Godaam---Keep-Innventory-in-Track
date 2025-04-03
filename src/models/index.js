import sequelize from "../db/index.js";
import User from "./user.model.js";
import Store from "./store.model.js";
// import UserStore from "./user_store.model.js";
import Product from "./product.model.js";
import StoreStock from "./store_stock.model.js";
import StockMovement from "./stockMovement.model.js";
import Image from "./image.model.js";
import SupplierProduct from "./supplier_product.js";
import Supplier from "./supplier.model.js";

// User.hasMany(Store, { foreignKey: "owner_id" });
// Store.belongsTo(User, { foreignKey: "owner_id" });

// User.belongsToMany(Store, { through: UserStore });
// Store.belongsToMany(User, { through: UserStore });

// Store.hasMany(Stock, { foreignKey: "store_id" });
// Stock.belongsTo(Store, { foreignKey: "store_id" });

// Product.hasMany(Stock, { foreignKey: "product_id" });
// Stock.belongsTo(Product, { foreignKey: "product_id" });

// Store.hasMany(StockMovement, { foreignKey: "store_id" });
// StockMovement.belongsTo(Store, { foreignKey: "store_id" });

// Product.hasMany(StockMovement, { foreignKey: "product_id" });
// StockMovement.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(StockMovement, { foreignKey: "product_id", onDelete: "CASCADE" });
Store.hasMany(StockMovement, { foreignKey: "store_id", onDelete: "CASCADE" });
User.hasMany(StockMovement, { foreignKey: "user_id", onDelete: "CASCADE" });

Store.hasMany(User, { foreignKey: "store_id", onDelete: "SET NULL" });
User.belongsTo(Store, { foreignKey: "store_id" });

Store.belongsToMany(Product, { through: StoreStock, foreignKey: "store_id" });
Product.belongsToMany(Store, { through: StoreStock, foreignKey: "product_id" });

Supplier.belongsToMany(Product, { through: SupplierProduct, foreignKey: "supplier_id" });
Product.belongsToMany(Supplier, { through: SupplierProduct, foreignKey: "product_id" });

Product.hasMany(Image, { foreignKey: "product_id", onDelete: "CASCADE" });
Image.belongsTo(Product, { foreignKey: "product_id" });

export { sequelize, User, Store, Supplier, Product, StockMovement, StoreStock, Image, SupplierProduct };
