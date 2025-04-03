import { Sequelize } from "sequelize";
import bcrypt from "bcryptjs";
import User from "./src/models/user.model.js";
const createAdminIfNotExists = async () => {
  try {
    // Check if an admin already exists
    const existingAdmin = await User.findOne({ where: { role: "admin" } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin", 10); // Hashing password

      await User.create({
        name: "admin",
        email:"admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin user created successfully.");
    } else {
      console.log("⚠️ Admin already exists.");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
};

createAdminIfNotExists();
