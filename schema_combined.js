const Image = sequelize.define("Image", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE" },
  image_url: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  // sku: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM("active", "discontinued"), defaultValue: "active" }
}, { timestamps: true });

//modified
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

// modified
const StoreStock = sequelize.define("StoreStock", {
  store_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Store, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Supplier, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  selling_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total_stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  last_updated: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

const Store = sequelize.define("Store", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT }
}, { timestamps: true });

const SupplierProduct = sequelize.define("SupplierProduct", {
  supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Supplier, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: "id" }, onDelete: "CASCADE", primaryKey: true },
  cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM("available", "unavailable"), defaultValue: "available" }
}, { timestamps: true });

const Supplier = sequelize.define("Supplier", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  contact_info: { type: DataTypes.TEXT }
}, { timestamps: true });

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  // store_id: { type: DataTypes.INTEGER, references: { model: Store, key: "id" }, onDelete: "SET NULL" }, i am using lazy load for this due to circlar dependenc
  role: { type: DataTypes.ENUM("admin", "store_manager"), allowNull: false }
}, { timestamps: true });

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
