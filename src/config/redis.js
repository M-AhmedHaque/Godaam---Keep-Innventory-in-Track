import Redis from "ioredis";

const redisClient = new Redis({
  host: "127.0.0.1", // Update if using a remote Redis server
  port: 6379,
  // password: "your-redis-password", // Uncomment if Redis requires authentication
});

redisClient.on("connect", () => console.log("Connected to Redis!"));
redisClient.on("error", (err) => console.error("Redis Error:", err));

export default redisClient;
