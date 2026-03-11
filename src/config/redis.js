const { createClient } = require("redis");

let client;

const connectRedis = async () => {
  client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  client.on("error", (err) => console.error("Redis error:", err));
  client.on("connect", () => console.log("✅ Redis connected"));
  await client.connect();
  return client;
};

const getRedis = () => {
  if (!client)
    throw new Error("Redis not initialized. Call connectRedis() first.");
  return client;
};

module.exports = { connectRedis, getRedis };
