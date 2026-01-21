const mongoose = require('mongoose');

const orderLineItemSchema = new mongoose.Schema({
  line_item_id: { type: Number, unique: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  shopify_order_id: Number,
  name: String,
  title: String,
  price: String,
  quantity: Number,
  sku: String,
  variant_id: Number,
  variant_title: String,
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  image_src: String,
}, { timestamps: true });

module.exports = mongoose.model('OrderLineItem', orderLineItemSchema);
