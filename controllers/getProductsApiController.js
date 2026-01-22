const Product = require('../models/Product');

exports.getProductsApi = async (req, res) => {
    try {
        // --- Pagination setup ---
        const page = parseInt(req.query.page, 1) || 1;
        const limit = 10; // Fixed limit per page
        const skip = (page - 1) * limit;
        const filter = { status: 'active' };
        const products = await Product.find(filter)
            .select('shopify_id title body_html vendor product_type tags status price compare_at_price sku inventory_quantity  main_image_src images options')
            .skip(skip)
            .limit(limit)
            .lean();

        
        const totalProducts = await Product.countDocuments(filter);

        return res.status(200).json({
            message: 'Products fetched successfully',
            status: 200,
            data: products,
            pagination: {
                total_products: totalProducts,
                total_pages: Math.ceil(totalProducts / limit),
                current_page: page,
                per_page: limit,
            },
        });

    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({
            message: 'Failed to fetch products',
            error: err.message,
            status: 500,
        });
    }
};