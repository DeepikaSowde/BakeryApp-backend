const express = require("express");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

const router = express.Router();

// Middleware to verify JWT token (placeholder - will be replaced with actual auth middleware)
const authenticate = (req, res, next) => {
  // TODO: Implement JWT verification when auth is added
  // For now, use a placeholder userId
  req.userId = req.header("userId") || req.body.userId || "guest-user"; // Placeholder
  next();
};

// GET /api/cart - Get user's cart items with product details
router.get("/", authenticate, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.userId })
      .populate("productId")
      .sort({ addedAt: -1 });

    // Filter out cart items where product no longer exists
    const validCartItems = cartItems.filter((item) => item.productId);

    // Calculate total
    const total = validCartItems.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);

    res.json({
      items: validCartItems,
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
      itemCount: validCartItems.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/cart - Add item to cart
router.post("/", authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if item already in cart
    let cartItem = await CartItem.findOne({ userId: req.userId, productId });

    if (cartItem) {
      // Update quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = new CartItem({
        userId: req.userId,
        productId,
        quantity,
      });
      await cartItem.save();
    }

    // Populate product details
    await cartItem.populate("productId");

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/cart/:productId - Update cart item quantity
router.put("/:productId", authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    const cartItem = await CartItem.findOne({
      userId: req.userId,
      productId: req.params.productId,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    // Populate product details
    await cartItem.populate("productId");

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart/:productId - Remove item from cart
router.delete("/:productId", authenticate, async (req, res) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      userId: req.userId,
      productId: req.params.productId,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete("/", authenticate, async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.userId });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/cart/count - Get cart item count
router.get("/count", authenticate, async (req, res) => {
  try {
    const count = await CartItem.countDocuments({ userId: req.userId });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
