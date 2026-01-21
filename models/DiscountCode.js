const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
    shopify_discount_code_id: { type: Number, unique: true },
    discount_price_rule_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiscountPriceRule'
    },
    code: String,
    usage_count: { type: Number, default: 0 },
    max_usage: Number,
}, { timestamps: true });

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
