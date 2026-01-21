const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    shopify_id: { type: Number, unique: true },
    title: String,
    body_html: String,
    vendor: String,
    product_type: String,
    handle: String,
    template_suffix: String,
    published_scope: String,
    tags: String,
    status: String,
    admin_graphql_api_id: String,
    options: Array,
    images: Array,
    main_image_src: String,
    main_image_alt: String,
    price: String,
    compare_at_price: String,
    sku: String,
    // variants: Array,
    inventory_quantity: Number,
    shopify_created_at: Date,
    shopify_published_at: Date,
});

module.exports = mongoose.model('Product', productSchema);
