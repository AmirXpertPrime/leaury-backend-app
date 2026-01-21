const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    shopify_variant_id: { type: Number, unique: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    shopify_product_id: Number,
    variant_image_id: Number,
    image_src: String,
    sku: String,
    grams: Number,
    price: String,
    title: String,
    weight: Number,
    barcode: String,
    option1: String,
    option2: String,
    option3: String,
    taxable: Boolean,
    position: Number,
    shopify_created_at: Date,
    shopify_updated_at: Date,
    weight_unit: String,
    compare_at_price: String,
    inventory_policy: String,
    inventory_item_id: Number,
    requires_shipping: Boolean,
    inventory_quantity: Number,
    fulfillment_service: String,
    admin_graphql_api_id: String,
    inventory_management: String,
    old_inventory_quantity: Number,
});

module.exports = mongoose.model('ProductVariant', variantSchema);


