const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const router = express.Router();

// Create multer storage for GridFS
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/products/upload - Upload image and create product
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const gfs = req.app.locals.gfs;
    const { name, price, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Create a write stream to GridFS
    const writestream = gfs.createWriteStream({
      filename: req.file.originalname,
      content_type: req.file.mimetype,
    });

    writestream.write(req.file.buffer);
    writestream.end();

    writestream.on("close", async (file) => {
      // Create product with GridFS file ID
      const product = new Product({
        name,
        price: parseFloat(price),
        image: file._id,
        description,
      });

      await product.save();
      res.status(201).json(product);
    });

    writestream.on("error", (error) => {
      res.status(500).json({ message: error.message });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products - Get all products with image data
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean(); // Use lean() for better performance
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/products/image/:id - Serve image from GridFS
router.get("/image/:id", async (req, res) => {
  try {
    const gfs = req.app.locals.gfs;
    const { id } = req.params;

    // Find the file in GridFS
    gfs.files.findOne({ _id: mongoose.Types.ObjectId(id) }, (err, file) => {
      if (err || !file) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Check if file is an image
      if (file.contentType.startsWith("image/")) {
        // Create read stream
        const readstream = gfs.createReadStream(file._id);
        readstream.pipe(res);
      } else {
        res.status(400).json({ message: "Not an image" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
