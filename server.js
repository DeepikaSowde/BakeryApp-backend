const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Grid = require("gridfs-stream");
require("dotenv").config({ encoding: "utf16le" });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using default connection
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");

  // Initialize GridFS
  const gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection("uploads");
  app.locals.gfs = gfs;
});

// Routes
app.use("/api/products", require("./routes/products"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
