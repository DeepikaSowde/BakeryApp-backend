const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["card", "upi", "netbanking"],
      required: true,
    },
    // For card payments
    cardNumber: {
      type: String,
      // Store only last 4 digits for security
    },
    cardHolderName: {
      type: String,
    },
    expiryMonth: {
      type: String,
    },
    expiryYear: {
      type: String,
    },
    cardBrand: {
      type: String, // visa, mastercard, etc.
    },
    // For UPI
    upiId: {
      type: String,
    },
    // For Net Banking
    bankName: {
      type: String,
    },
    // Common fields
    isDefault: {
      type: Boolean,
      default: false,
    },
    // Encrypted payment token (would be provided by payment gateway)
    paymentToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default payment method per user
paymentMethodSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Remove sensitive data from JSON output
paymentMethodSchema.methods.toJSON = function () {
  const paymentObject = this.toObject();
  delete paymentObject.paymentToken;
  return paymentObject;
};

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
