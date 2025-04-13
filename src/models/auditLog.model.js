import sequelize from "../db/index.js";
import User from "./user.model.js";
import { DataTypes } from "sequelize";
import Sequelize from "sequelize";
const AuditLog = sequelize.define("AuditLog", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    entity_type: { type: DataTypes.STRING, allowNull: false },
    entity_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE"), allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" }, onDelete: "CASCADE" },
    old_value: { type: DataTypes.JSON },
    new_value: { type: DataTypes.JSON },
    timestamp: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
  }, { timestamps: false });
  
  export default AuditLog
