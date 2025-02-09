const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productValue: {
    type: Number,
    required: true
  },
  tickets: {
    type: [Number],
    default: []
  },
  checkoutId: {
    type: String
  },
  paidAt: {
    type: Date
  },
  pickedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date
  }
});

const contactSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      required: true
    },
    contactId: {
      type: String,
      required: true,
      unique: true
    },
    contactName: {
      type: String,
      default: ""
    },
    orders: [orderSchema]
  },
  {
    timestamps: true
  }
);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = { Contact };
