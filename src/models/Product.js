const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    shopify_id: { 
        type: Number, 
        required: true,
        unique: true,
        sparse: true,
        index: true,
    },
    title: {
        type: String,
        trim: true,
    },
    body_html: String,
    vendor: {
        type: String,
        trim: true,
    },
    product_type: {
        type: String,
        trim: true,
        index: true,
    },
    handle: String,
    template_suffix: String,
    published_scope: String,
    tags: {
        type: String,
        index: true,
    },
    status: {
        type: String,
        default: 'active',
    },
    admin_graphql_api_id: String,
    options: Array,
    images: Array,
    main_image_src: String,
    main_image_alt: String,
    price: {
        type: Number,
        get: v => v?.toString(),
        set: v => {
            if (v === null || v === undefined) return null;
            const num = Number(v);
            return Number.isFinite(num) ? num : null;
        },
    },
    compare_at_price: {
        type: Number,
        get: v => v?.toString(),
        set: v => {
            if (v === null || v === undefined) return null;
            const num = Number(v);
            return Number.isFinite(num) ? num : null;
        },
    },
    sku: String,
    inventory_quantity: {
        type: Number,
        default: 0,
    },
    shopify_created_at: Date,
    shopify_published_at: Date,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
