const express = require("express");
const UserAddress = require("../models/UserAddress");
const authenticate = require("../middleware/auth");

const router = express.Router();

// GET /api/addresses - Get user's addresses
router.get("/", authenticate, async (req, res) => {
  try {
    const addresses = await UserAddress.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/addresses - Add new address
router.post("/", authenticate, async (req, res) => {
  try {
    const addressData = { ...req.body, userId: req.userId };

    const address = new UserAddress(addressData);
    await address.save();

    res.status(201).json(address);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Address already exists" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// PUT /api/addresses/:id - Update address
router.put("/:id", authenticate, async (req, res) => {
  try {
    const address = await UserAddress.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    Object.assign(address, req.body);
    await address.save();

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/addresses/:id - Delete address
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const address = await UserAddress.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/addresses/:id/set-default - Set address as default
router.put("/:id/set-default", authenticate, async (req, res) => {
  try {
    const address = await UserAddress.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // This will trigger the pre-save middleware to unset other defaults
    address.isDefault = true;
    await address.save();

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
