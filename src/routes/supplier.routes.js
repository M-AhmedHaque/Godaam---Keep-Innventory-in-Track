import {addSupplier,deleteSupplier,getAllSuppliers,getProductsBySupplier,getSuppliersForProduct,addSupplierToProduct} from "../controller/supplier.controller.js"
import express from "express";
import { authorizeRoles } from "../middleware/verifyRole.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/", verifyJWT, authorizeRoles("admin"),addSupplier)
router.get("/", verifyJWT, authorizeRoles("admin", "store_manager"),getAllSuppliers)
router.delete("/:id", verifyJWT, authorizeRoles("admin"),deleteSupplier)
router.post("/add-supplier-to-product", verifyJWT, authorizeRoles("admin"),addSupplierToProduct) // this makes record in supplierproduct table about what product supplier is provinding at what cost proze
router.get("/get-suppliers-for-product/:id", verifyJWT, authorizeRoles("admin", "store_manager"),getSuppliersForProduct)//this will get all suppliers of a product 
router.get("/get-products-by-supplier/:id", verifyJWT, authorizeRoles("admin", "store_manager"),getProductsBySupplier) //this will get all the products of a supplier

export default router
// POST /api/suppliers → Admin adds a new supplier.

// GET /api/suppliers → Both admin & store managers view suppliers.

// GET /api/suppliers/:id → Retrieve supplier details.

// PUT /api/suppliers/:id → Admin updates supplier details.

// DELETE /api/suppliers/:id → Admin removes a supplier.