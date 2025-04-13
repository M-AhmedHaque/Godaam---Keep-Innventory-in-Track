import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.id;
        const userSession = await redisClient.get(`session:${userId}`);
        if (userSession) {
            req.user = JSON.parse(userSession);
        } else {
            const user = await User.findByPk(userId, { attributes: { exclude: ["password"] } });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            await redisClient.set(`session:${userId}`, JSON.stringify(user), "EX", 3600);
            req.user = user;
        }
        

        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid access token" });
    }
};
