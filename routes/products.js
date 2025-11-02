const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Create multer storage for GridFS
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/products/upload - Upload image and create product
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const bucket = req.app.locals.bucket;
    const { name, price, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Create a write stream to GridFSBucket
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.write(req.file.buffer);
    uploadStream.end();

    uploadStream.on("finish", async () => {
      // Create product with GridFS file ID
      const product = new Product({
        name,
        price: parseFloat(price),
        image: uploadStream.id,
        description,
      });

      await product.save();
      res.status(201).json(product);
    });

    uploadStream.on("error", (error) => {
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

// GET /api/products/image/:id - Serve image from GridFSBucket
router.get("/image/:id", async (req, res) => {
  try {
    const bucket = req.app.locals.bucket;
    const { id } = req.params;

    // Find the file in GridFSBucket
    const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const file = files[0];

    // Check if file is an image
    if (file.contentType.startsWith("image/")) {
      // Set content type header
      res.set("Content-Type", file.contentType);
      // Create read stream
      const downloadStream = bucket.openDownloadStream(file._id);
      downloadStream.pipe(res);
    } else {
      res.status(400).json({ message: "Not an image" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
