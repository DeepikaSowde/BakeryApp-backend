const express = require("express");
const PaymentMethod = require("../models/PaymentMethod");

const router = express.Router();

// Middleware to verify JWT token (placeholder - will be replaced with actual auth middleware)
const authenticate = (req, res, next) => {
  // TODO: Implement JWT verification when auth is added
  // For now, use a placeholder userId
  req.userId = req.header("userId") || req.body.userId || "guest-user"; // Placeholder
  next();
};

// GET /api/payment-methods - Get user's payment methods
router.get("/", authenticate, async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payment-methods - Add new payment method
router.post("/", authenticate, async (req, res) => {
  try {
    const paymentData = { ...req.body, userId: req.userId };

    // For card payments, only store last 4 digits
    if (paymentData.type === "card" && paymentData.cardNumber) {
      paymentData.cardNumber = paymentData.cardNumber.slice(-4);
    }

    const paymentMethod = new PaymentMethod(paymentData);
    await paymentMethod.save();

    res.status(201).json(paymentMethod);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Payment method already exists" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// PUT /api/payment-methods/:id - Update payment method
router.put("/:id", authenticate, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    // For card payments, only store last 4 digits
    if (req.body.type === "card" && req.body.cardNumber) {
      req.body.cardNumber = req.body.cardNumber.slice(-4);
    }

    Object.assign(paymentMethod, req.body);
    await paymentMethod.save();

    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/payment-methods/:id - Delete payment method
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    res.json({ message: "Payment method deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/payment-methods/:id/set-default - Set payment method as default
router.put("/:id/set-default", authenticate, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    // This will trigger the pre-save middleware to unset other defaults
    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
