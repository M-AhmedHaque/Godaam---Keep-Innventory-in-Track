// import { DataTypes } from "sequelize";
// import sequelize from "../db/index.js";
// import User from "./user.model.js";
// import Store from "./store.model.js";

// const UserStore = sequelize.define("UserStore", {
//     user_id: { type: DataTypes.INTEGER, references: { model: User, key: "id" }, onDelete: "CASCADE" },
//     store_id: { type: DataTypes.INTEGER, references: { model: Store, key: "id" }, onDelete: "CASCADE" },
//     role: { type: DataTypes.ENUM("owner", "manager", "cashier", "staff"), allowNull: false }
//   }, { timestamps: true });

// export default UserStore