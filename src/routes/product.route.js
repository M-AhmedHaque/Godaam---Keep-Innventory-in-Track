import express from "express";
import Product from "../models/product.model.js";
import Stock from "../models/store_stock.model.js";
import Image from "../models/image.model.js";
import upload from "../middleware/multer.middleware.js";
import { addProduct,deleteProduct,getAllProducts, updateProduct,getProductById } from "../controller/product.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/verifyRole.middleware.js";
const router = express.Router();

router.post("/", verifyJWT, authorizeRoles("admin"),upload.array("images",5),addProduct)
router.get("/", verifyJWT, authorizeRoles("admin", "store_manager"),getAllProducts)
router.get("/:id", verifyJWT, authorizeRoles("admin", "store_manager"),getProductById)
router.put("/:id", verifyJWT, authorizeRoles("admin"),upload.array("images",5),updateProduct)
router.delete("/:id", verifyJWT, authorizeRoles("admin"), deleteProduct)

export default router;