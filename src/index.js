import dotenv from "dotenv";
import sequelize from "./db/index.js";
import app from "./app.js";
import {  User, Store, Supplier, Product, StockMovement, StoreStock, Image, SupplierProduct } from "./models/index.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        sequelize
        .sync({ alter: true })
        .then(() => console.log("Tables created successfully"))
        .catch((err) => console.log("Error: " + err));

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};
  
startServer();
