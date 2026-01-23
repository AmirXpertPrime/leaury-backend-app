const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

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
    shopify_published_at: 1,
});

exports.getNewArrivalsApi = async (req, res) => {
    try {
        const variantCollection = ProductVariant.collection.name;

        const data = await Product.aggregate([
            { $match: { status: 'active', shopify_published_at: { $ne: null } } },
            { $sort: { shopify_published_at: -1, _id: 1 } },
            { $limit: 6 },
            { $project: PRODUCT_FIELDS_PROJECTION },
            {
                $lookup: {
                    from: variantCollection,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'productVariant',
                },
            },
        ]);

        return res.status(200).json({
            message: 'New arrivals fetched successfully',
            status: 200,
            data,
            pagination: {
                total_products: data.length,
                total_pages: 1,
                current_page: 1,
                per_page: 6,
            },
        });
    } catch (err) {
        console.error('Error fetching new arrivals:', err);
        return res.status(500).json({
            message: 'Failed to fetch new arrivals',
            error: err.message,
            status: 500,
        });
    }
};


