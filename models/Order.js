const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  shopify_order_id: { type: Number, unique: true },
  shopify_customer_id: Number,
  name: String,
  order_number: Number,
  financial_status: String,
  order_status_url: String,
  processed_at: Date,
  confirmation_number: String,
  confirmed: Boolean,
  subtotal_price: String,
  total_discounts: String,
  total_price: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
