import sequelize from "../db/index.js";
import User from "./user.model.js";
import { DataTypes } from "sequelize";
import Sequelize from "sequelize";
const AuditLog = sequelize.define("AuditLog", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    entity_type: { type: DataTypes.STRING, allowNull: false }, // e.g., 'StockMovement'
    entity_id: { type: DataTypes.INTEGER, allowNull: false },  // ID of the affected record
    action: { type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE"), allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" }, onDelete: "CASCADE" },
    old_value: { type: DataTypes.JSON }, // Stores previous state
    new_value: { type: DataTypes.JSON }, // Stores updated state
    timestamp: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
  }, { timestamps: false });
  
  export default AuditLog
