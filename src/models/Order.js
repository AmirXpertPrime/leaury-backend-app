const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  shopify_order_id: { 
    type: Number, 
    required: true,
    unique: true,
    sparse: true,
    index: true,
  },
  shopify_customer_id: {
    type: Number,
    index: true,
  },
  name: {
    type: String,
    trim: true,
  },
  order_number: Number,
  financial_status: String,
  order_status_url: String,
  processed_at: Date,
  confirmation_number: String,
  confirmed: Boolean,
  subtotal_price: Number,
  total_discounts: Number,
  total_price: Number,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
