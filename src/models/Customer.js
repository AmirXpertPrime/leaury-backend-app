const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    shopify_customer_id: { type: Number, unique: true },
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    address1: String,
    city: String,
    province: String,
    zip: String,
    country: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Customer", customerSchema);
