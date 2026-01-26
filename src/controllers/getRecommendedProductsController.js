const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const OrderLineItem = require('../models/OrderLineItem');

const PRODUCT_FIELDS_PROJECTION = Object.freeze({
    shopify_id: 1,
    title: 1,
    body_html: 1,
    vendor: 1,
    product_type: 1,
    tags: 1,
    status: 1,
    price: 1,
    compare_at_price: 1,
    sku: 1,
    inventory_quantity: 1,
    main_image_src: 1,
    images: 1,
    options: 1,
});

exports.getRecommendedProductsApi = async (req, res) => {
    try {
        const variantCollection = ProductVariant.collection.name;
        const productCollection = Product.collection.name;

        // "ordered 4 times or greater" can be interpreted in a few ways depending on your data:
        // - appears in >= 4 distinct orders (recommended)
        // - total quantity ordered >= 4
        // We'll support either so this endpoint works reliably across stores.
        const recommended = await OrderLineItem.aggregate([
            // NOTE: do NOT rely on OrderLineItem.product_id being populated.
            // It can be null if orders were synced before variants/products.
            // Instead, derive product_id via variant_id -> ProductVariant.shopify_variant_id -> ProductVariant.product_id.
            { $match: { variant_id: { $ne: null }, shopify_order_id: { $ne: null } } },
            {
                $lookup: {
                    from: variantCollection,
                    localField: 'variant_id',
                    foreignField: 'shopify_variant_id',
                    as: '__variant',
                },
            },
            { $unwind: '$__variant' },
            { $match: { '__variant.product_id': { $ne: null } } },
            {
                $group: {
                    _id: '$__variant.product_id',
                    __orderIds: { $addToSet: '$shopify_order_id' },
                    __totalQty: { $sum: { $ifNull: ['$quantity', 0] } },
                    __lineItemCount: { $sum: 1 },
                },
            },
            { $addFields: { __ordersCount: { $size: '$__orderIds' } } },
            {
                $match: {
                    $or: [
                        { __ordersCount: { $gte: 4 } },
                        { __totalQty: { $gte: 4 } },
                        { __lineItemCount: { $gte: 4 } },
                    ],
                },
            },
            { $sort: { __ordersCount: -1, __totalQty: -1, __lineItemCount: -1, _id: 1 } },
            // Pull more than 5 before filtering to active products, then cut to 5 at the end.
            { $limit: 2000 },
            {
                $lookup: {
                    from: productCollection,
                    let: { pid: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$pid'] } } },
                        { $match: { status: 'active' } },
                        { $project: PRODUCT_FIELDS_PROJECTION },
                    ],
                    as: '__product',
                },
            },
            { $unwind: '$__product' },
            { $replaceRoot: { newRoot: '$__product' } },
            {
                $lookup: {
                    from: variantCollection,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'productVariant',
                },
            },
            { $limit: 5 },
        ]);

        return res.status(200).json({
            message: 'Recommended products fetched successfully',
            status: 200,
            data: recommended,
            pagination: {
                total_products: recommended.length,
                total_pages: 1,
                current_page: 1,
                per_page: 5,
            },
        });
    } catch (err) {
        console.error('Error fetching recommended products:', err);
        return res.status(500).json({
            message: 'Failed to fetch recommended products',
            error: err.message,
            status: 500,
        });
    }
};


