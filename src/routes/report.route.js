import express from "express";
import { getSupplierReport,getCurrentStock,getProfitAndSalesReport,getStockMovements } from "../controller/report.controller";
const router = express.Router();

// Stock Movement Reports
router.get("/stock-movements", verifyJWT, authorizeRoles("admin", "store_manager"), getStockMovements);

// Current Stock Reports
router.get("/current-stock", verifyJWT, authorizeRoles("admin", "store_manager"), getCurrentStock);

// Supplier Reports
router.get("/supplier-report", verifyJWT, authorizeRoles("admin", "store_manager"), getSupplierReport);

// Profit and Sales Reports
router.get("/profit-sales-report", verifyJWT, authorizeRoles("admin", "store_manager"), getProfitAndSalesReport);

export default router