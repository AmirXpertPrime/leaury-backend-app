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
});

exports.getSingleProductApi = async (req, res) => {
    try {
        // Accept both /product/:id and /product?id=...
        const rawId = req.params?.id ?? req.query?.id;
        const idNum = Number(String(rawId ?? '').trim());

        if (!Number.isFinite(idNum)) {
            return res.status(400).json({
                message: 'Invalid product id',
                status: 400,
            });
        }

        const variantCollection = ProductVariant.collection.name;
        const result = await Product.aggregate([
            {
                $match: {
                    shopify_id: idNum,
                },
            },
            { $project: PRODUCT_FIELDS_PROJECTION },
            {
                $lookup: {
                    from: variantCollection,
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'productVariant',
                },
            },
            { $limit: 1 },
        ]);

        const product = result?.[0] || null;
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                status: 404,
            });
        }

        return res.status(200).json({
            message: 'Product fetched successfully',
            status: 200,
            data: product,
        });
    } catch (error) {
        console.error('Error fetching single product:', error);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};