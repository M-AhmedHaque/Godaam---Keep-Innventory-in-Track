import express from "express";
import { addStock,saleStock,removeStock,getStockMovements,returnStockToSupplier } from "../controller/stock.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/verifyRole.middleware.js";
const router = express.Router();

router.post("/add", verifyJWT, authorizeRoles("admin", "store_manager"), addStock);          // Add stock to a store
router.post("/sale", verifyJWT, authorizeRoles("admin", "store_manager"), saleStock);        // Record a sale (decrease stock)
router.post("/remove", verifyJWT, authorizeRoles("admin", "store_manager"), removeStock);    // Remove stock (damaged, expired, etc.)
router.post("/return", verifyJWT, authorizeRoles("admin", "store_manager"), returnStockToSupplier);    // Remove stock (damaged, expired, etc.)
router.get("/movements", verifyJWT, authorizeRoles("admin", "store_manager"), getStockMovements);  // Retrieve stock movements (filter by store, product, or type)

export default router

