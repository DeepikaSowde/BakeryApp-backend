const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// DEBUG: show whether Razorpay env vars are present (do NOT log secrets)
console.log(
  "Razorpay keys provided:",
  !!process.env.RAZORPAY_KEY_ID,
  !!process.env.RAZORPAY_KEY_SECRET
);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using default connection
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");

  // Initialize GridFSBucket
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  app.locals.bucket = bucket;
});

// Routes
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require("./routes/users"));
app.use("/api/addresses", require("./routes/addresses"));
app.use("/api/payment-methods", require("./routes/payment-methods"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/cart", require("./routes/cart"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
