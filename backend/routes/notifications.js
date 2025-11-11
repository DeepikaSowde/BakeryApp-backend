const express = require("express");
const NotificationPreference = require("../models/NotificationPreference");

const router = express.Router();

// Middleware to verify JWT token (placeholder - will be replaced with actual auth middleware)
const authenticate = (req, res, next) => {
  // TODO: Implement JWT verification when auth is added
  // For now, use a placeholder userId
  req.userId = req.header("userId") || req.body.userId || "guest-user"; // Placeholder
  next();
};

// GET /api/notifications/preferences - Get user's notification preferences
router.get("/preferences", authenticate, async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({
      userId: req.userId,
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = new NotificationPreference({ userId: req.userId });
      await preferences.save();
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/preferences - Update user's notification preferences
router.put("/preferences", authenticate, async (req, res) => {
  try {
    const updateData = req.body;

    let preferences = await NotificationPreference.findOne({
      userId: req.userId,
    });

    if (!preferences) {
      // Create new preferences if they don't exist
      preferences = new NotificationPreference({
        userId: req.userId,
        ...updateData,
      });
    } else {
      // Update existing preferences
      Object.assign(preferences, updateData);
    }

    await preferences.save();

    res.json({
      preferences,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/preferences/reset - Reset to default preferences
router.put("/preferences/reset", authenticate, async (req, res) => {
  try {
    const defaultPreferences = {
      orderUpdates: true,
      promotionalOffers: true,
      newProductAlerts: true,
      deliveryUpdates: true,
      paymentReminders: true,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    };

    let preferences = await NotificationPreference.findOne({
      userId: req.userId,
    });

    if (!preferences) {
      preferences = new NotificationPreference({
        userId: req.userId,
        ...defaultPreferences,
      });
    } else {
      Object.assign(preferences, defaultPreferences);
    }

    await preferences.save();

    res.json({
      preferences,
      message: "Notification preferences reset to defaults",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
