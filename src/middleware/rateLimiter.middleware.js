import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";

const rateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args), // Use Redis to track requests
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow max 100 requests per windowMs per IP
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable old headers
});

export default rateLimiter;
