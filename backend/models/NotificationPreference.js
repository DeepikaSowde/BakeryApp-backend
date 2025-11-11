const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    orderUpdates: {
      type: Boolean,
      default: true,
    },
    promotionalOffers: {
      type: Boolean,
      default: true,
    },
    newProductAlerts: {
      type: Boolean,
      default: true,
    },
    deliveryUpdates: {
      type: Boolean,
      default: true,
    },
    paymentReminders: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema
);
