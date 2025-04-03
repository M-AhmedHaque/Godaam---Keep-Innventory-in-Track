import { DataTypes } from "sequelize";
import sequelize from "../db/index.js";
import Store from "./store.model.js";
// const User = sequelize.define("User", {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     name: { type: DataTypes.STRING, allowNull: false },
//     email: { type: DataTypes.STRING, allowNull: false, unique: true },
//     password: { type: DataTypes.STRING, allowNull: false }
//   }, { timestamps: true });
const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  // store_id: { type: DataTypes.INTEGER, references: { model: Store, key: "id" }, onDelete: "SET NULL" }, i am using lazy load for this due to circlar dependenc
  role: { type: DataTypes.ENUM("admin", "store_manager"), allowNull: false }
}, { timestamps: true });

export default User
 