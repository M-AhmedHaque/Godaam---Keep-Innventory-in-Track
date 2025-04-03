import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sequelize from "../db/index.js";

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

const register = async (req, res) => {
    try {
        const { name, email, password,store_id,role } = req.body;

        if(!name|| !email|| !password||!role){
            return res.status(400).json({ message: "Name, email, password and role are required fields." });   
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        if(role == "admin"){
            store_id = null
        }
        const newUser = await User.create({ name, email, password: hashedPassword,store_id:store_id,role:role });

        res.status(201).json({ user:newUser,message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid email or password" });

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in HTTP-Only Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({ user,accessToken,refreshToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });

            const user = await User.findByPk(decoded.id);
            if (!user) return res.status(403).json({ message: "User not found" });

            const newAccessToken = generateAccessToken(user);
            res.status(200).json({ user,accessToken: newAccessToken,refreshToken });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "Strict" });
    res.status(200).json({ message: "Logged out successfully" });
};

export {
    register,
    login,
    refreshToken,
    logout
}