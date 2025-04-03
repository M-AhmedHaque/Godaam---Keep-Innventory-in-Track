import {createStore,getAllStores,getStoreDetails,updateStore,deleteStore,getStoreStock,getStockDetails} from "../controller/store.controller.js"
import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/verifyRole.middleware.js";
const router = express.Router();

router.post("/", verifyJWT, authorizeRoles("admin"),createStore)
router.get("/", verifyJWT, authorizeRoles("admin", "store_manager"),getAllStores)
router.put("/", verifyJWT, authorizeRoles("admin", "store_manager"),updateStore)
router.get("/:id", verifyJWT, authorizeRoles("admin", "store_manager"),getStoreDetails)
router.delete("/:id", verifyJWT, authorizeRoles("admin"),deleteStore)
router.get("/:id", verifyJWT, authorizeRoles("admin", "store_manager"),getStoreStock) //jo bhi store ka sara stock of all products
router.get("/:storeId/:productId", verifyJWT, authorizeRoles("admin", "store_manager"),getStockDetails) // 
// router.post("/add-stock-to-store",addStockToStore)
// router.post("/remove-stock-from-store",removeStockFromStore)
// router.get("/get-stock-movement-of-store/:id",getStockMovements)

export default router
