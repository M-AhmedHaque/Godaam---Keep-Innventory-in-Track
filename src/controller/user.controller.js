import User from "../models/user.model.js";
import sequelize from "../db/index.js";
  
const getAllUsers = async(req,res)=>{
    try {
        const users = await User.findAll()
        return res.status(201).json({ message: "Users fetched successfully", users });
        
    } catch (error) {
        return res.status(400).json({ message: "Users can not be fetched"});

    }
}

const getUsersById = async(req,res)=>{
    try {
        const userId = req.params.id
        const user = await User.findOne({where:{id:userId}})
        return res.status(201).json({ message: "User fetched successfully", user });
        
    } catch (error) {
        return res.status(400).json({ message: "User can not be fetched"});

    }
}

const updateUser = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, email, store_id, role } = req.body;
        const userId = req.params.id;

        if (!name || !email || !role) {
            return res.status(400).json({ message: "Name, email, and role are required fields." });
        }

        // Check if user exists
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the new email is already taken (excluding current user's email)
        const existingUser = await User.findOne({ where: { email }, transaction });
        if (existingUser && existingUser.id !== userId) {
            await transaction.rollback(); 
            return res.status(400).json({ message: "Email already exists" });
        }

        // Update user
        await User.update(
            { name, email, store_id, role },
            { where: { id: userId }, transaction }
        );

        await transaction.commit(); 
        return res.status(200).json({ message: "User updated successfully" });

    } catch (error) {
        await transaction.rollback(); 
        return res.status(500).json({ message: "User cannot be updated", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const transaction = await sequelize.transaction(); 
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback(); 
            return res.status(404).json({ message: "User not found" });
        }

        await User.destroy({ where: { id: userId }, transaction });

        await transaction.commit(); 
        return res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        await transaction.rollback(); 
        return res.status(500).json({ message: "User cannot be deleted", error: error.message });
    }
};

export {getAllUsers,getUsersById,updateUser,deleteUser}