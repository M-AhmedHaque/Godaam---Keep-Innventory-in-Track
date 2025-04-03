import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import stockRoutes from "./routes/stock.route.js"
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.routes.js"
import productRoutes from "./routes/product.route.js"
import supplierRoutes from "./routes/supplier.routes.js"
import storeRoutes from "./routes/store.route.js"
import rateLimiter from "./middleware/rateLimiter.middleware.js";

const app = express();

app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(rateLimiter)//doing it for all the routes

app.use("/api/v2/auth",authRoutes)
app.use("/api/v2/user",userRoutes)
app.use("/api/v2/product",productRoutes)
app.use("/api/v2/supplier",supplierRoutes)
app.use("/api/v2/store",storeRoutes)

export default app; // Use default export
