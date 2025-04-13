import express from "express";
import { addStock,saleStock,removeStock,getStockMovements,returnStockToSupplier } from "../controller/stock.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/verifyRole.middleware.js";
const router = express.Router();

router.post("/add", verifyJWT, authorizeRoles("admin", "store_manager"), addStock);
router.post("/sale", verifyJWT, authorizeRoles("admin", "store_manager"), saleStock);
router.post("/remove", verifyJWT, authorizeRoles("admin", "store_manager"), removeStock);
router.post("/return", verifyJWT, authorizeRoles("admin", "store_manager"), returnStockToSupplier); 
router.get("/movements", verifyJWT, authorizeRoles("admin", "store_manager"), getStockMovements);
export default router

