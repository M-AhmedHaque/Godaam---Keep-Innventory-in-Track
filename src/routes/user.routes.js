import express from "express";
const router = express.Router();
import { getAllUsers,getUsersById,updateUser,deleteUser } from "../controller/user.controller.js";


router.get("/",getAllUsers)

// Get all products
router.get("/:id",getUsersById)

// Update a product
router.put("/:id",updateUser)

// Delete a product
router.delete("/:id", deleteUser)


export default router
// GET /api/users → Admin gets all users.

// GET /api/users/:id → Admin retrieves user details.

// PUT /api/users/:id → Admin updates user details.

// DELETE /api/users/:id → Admin deletes users.