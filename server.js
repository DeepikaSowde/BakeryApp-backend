const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
