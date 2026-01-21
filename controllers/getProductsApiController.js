const Product = require('../models/Product');

exports.getProductsApi = async (req, res) => {
    try {
        const products = await Product.find()
            .select(' shopify_id title body_html vendor product_type tags status price compare_at_price sku')
            .where('status', 'active')
            .lean();


        return res.status(200).json({
            message: 'Products fetched successfully',
            products,
            status: 200,
            total_products: products.length,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Failed to fetch products',
            error: err.message,
            status: 500,
        });
    }
};
