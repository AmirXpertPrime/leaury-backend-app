const mongoose = require('mongoose');

const discountPriceRuleSchema = new mongoose.Schema({
    shopify_price_rule_id: { type: Number, unique: true },
    title: String,
    value_type: String,
    value: String,
    target_type: String,
    target_selection: String,
    starts_at: Date,
    ends_at: Date,
}, { timestamps: true });

module.exports = mongoose.model('DiscountPriceRule', discountPriceRuleSchema);
