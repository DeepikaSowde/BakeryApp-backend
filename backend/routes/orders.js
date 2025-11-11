const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Razorpay = require("razorpay");

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

const router = express.Router();

// Middleware to verify JWT (placeholder for now)
const authenticate = (req, res, next) => {
  // TODO: Implement JWT verification when auth is added
  // For now, use a placeholder userId
  req.userId = req.body.userId || req.header("userId") || "guest-user"; // Placeholder
  next();
};

// POST /api/orders - Create a new order
router.post("/", authenticate, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      total += product.price * item.quantity;
    }

    // Create Razorpay order
    let razorpayOrder;
    if (paymentMethod.type === "card") {
      if (!razorpay) {
        return res.status(500).json({ message: "Razorpay not configured" });
      }
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // Convert to paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
        notes: {
          orderItems: JSON.stringify(orderItems),
        },
      });
    }

    // Create order
    const order = new Order({
      userId: req.userId,
      items: orderItems,
      total,
      deliveryAddress,
      paymentMethod: {
        type: paymentMethod.type,
        last4: paymentMethod.last4,
        paymentIntentId: razorpayOrder?.id,
      },
      estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      notes,
    });

    await order.save();

    res.status(201).json({
      order,
      razorpayOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:userId - Get user's order history
router.get("/:userId", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("items.productId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/order/:orderId - Get specific order details
router.get("/order/:orderId", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "items.productId"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order
    if (order.userId !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:orderId/status - Update order status (admin or automated)
router.put("/:orderId/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // TODO: Add admin check when auth is implemented
    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders/confirm-payment - Confirm payment after successful Razorpay payment
router.post("/confirm-payment", authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay) {
      return res.status(500).json({ message: "Razorpay not configured" });
    }

    // Verify payment signature
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update order status to confirmed
    const order = await Order.findOneAndUpdate(
      { "paymentMethod.paymentIntentId": razorpay_order_id },
      { status: "confirmed" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order, status: "confirmed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
