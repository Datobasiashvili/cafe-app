const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", orderRoutes);
app.use("/api", productRoutes);

// 404 Handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal server error" 
  });
});

const MONGOURL = process.env.MONGO_URI;
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("MongoDB database connected");
    console.log(`Environment: ${process.env.NODE_ENV}`);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB connection fails
  });

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

