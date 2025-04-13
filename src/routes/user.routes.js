import express from "express";
const router = express.Router();
import { getAllUsers,getUsersById,updateUser,deleteUser } from "../controller/user.controller.js";


router.get("/",getAllUsers)
router.get("/:id",getUsersById)
router.put("/:id",updateUser)
router.delete("/:id", deleteUser)


export default router