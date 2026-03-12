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
const dealerRoutes = require("./routes/dealerRoutes");
const partRoutes = require("./routes/partRoutes");
const searchRoutes = require("./routes/searchRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

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
app.use("/dealer", dealerRoutes);
app.use("/parts", partRoutes);
app.use("/search", searchRoutes);
app.use("/vehicles", vehicleRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Parts Adda API");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
