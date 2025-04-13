import express from "express";
import { getSupplierReport,getCurrentStock,getProfitAndSalesReport,getStockMovements } from "../controller/report.controller";
const router = express.Router();

router.get("/stock-movements", verifyJWT, authorizeRoles("admin", "store_manager"), getStockMovements);
router.get("/current-stock", verifyJWT, authorizeRoles("admin", "store_manager"), getCurrentStock);
router.get("/supplier-report", verifyJWT, authorizeRoles("admin", "store_manager"), getSupplierReport);
router.get("/profit-sales-report", verifyJWT, authorizeRoles("admin", "store_manager"), getProfitAndSalesReport);

export default router