require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/parts", catalogRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/seller", sellerRoutes);
app.use("/notifications", notificationRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
