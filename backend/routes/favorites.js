const express = require("express");
const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

const router = express.Router();

// Middleware to verify JWT token (placeholder - will be replaced with actual auth middleware)
const authenticate = (req, res, next) => {
  // TODO: Implement JWT verification when auth is added
  // For now, use a placeholder userId
  req.userId = req.header("userId") || req.body.userId || "guest-user"; // Placeholder
  next();
};

// GET /api/favorites - Get user's favorites with product details
router.get("/", authenticate, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    // Filter out any favorites where product no longer exists
    const validFavorites = favorites.filter((fav) => fav.productId);

    res.json(validFavorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/favorites - Add product to favorites
router.post("/", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      userId: req.userId,
      productId,
    });
    if (existingFavorite) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    const favorite = new Favorite({ userId: req.userId, productId });
    await favorite.save();

    // Populate product details
    await favorite.populate("productId");

    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Product already in favorites" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// DELETE /api/favorites/:productId - Remove product from favorites
router.delete("/:productId", authenticate, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      userId: req.userId,
      productId: req.params.productId,
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({ message: "Product removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/favorites/check/:productId - Check if product is in favorites
router.get("/check/:productId", authenticate, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.userId,
      productId: req.params.productId,
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
