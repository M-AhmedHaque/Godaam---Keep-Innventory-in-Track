import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findByPk(decoded.id, { attributes: { exclude: ["password"] } });

        if (!req.user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid access token" });
    }
};


// export const verifyjwt = async (req, res, next) => {
//     try {
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

//         if (!token) {
//             return res.status(401).json({ success: false, message: "Unauthorized request. No token provided." });
//         }

//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         } catch (err) {
//             return res.status(401).json({ success: false, message: "Invalid or expired access token." });
//         }

//         const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

//         if (!user) {
//             return res.status(403).json({ success: false, message: "User not found. Access denied." });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.error("JWT Verification Error:", error.message);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };
