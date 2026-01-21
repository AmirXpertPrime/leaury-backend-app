const axios = require('axios');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

exports.syncShopifyProducts = async (req, res) => {
    try {
        let nextUrl = `${process.env.SHOPIFY_API_URL}/products.json?limit=250&published_status=any`;
        let allProducts = [];

        while (nextUrl) {
            const response = await axios.get(nextUrl, {
                headers: {
                    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
                    'Content-Type': 'application/json',
                    'User-Agent': 'MyApp/1.0'
                }
            });

            const products = response.data.products;
            console.log(`Fetched ${products.length} products`);
            allProducts.push(...products);

            const linkHeader = response.headers.link;
            if (linkHeader) {
                const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                nextUrl = match ? match[1] : null;
            } else {
                nextUrl = null;
            }
        }

        for (const shopifyProduct of allProducts) {
            const product = await Product.findOneAndUpdate(
                { shopify_id: shopifyProduct.id },
                {
                    title: shopifyProduct.title,
                    body_html: shopifyProduct.body_html,
                    vendor: shopifyProduct.vendor,
                    product_type: shopifyProduct.product_type,
                    handle: shopifyProduct.handle,
                    template_suffix: shopifyProduct.template_suffix,
                    published_scope: shopifyProduct.published_scope,
                    tags: shopifyProduct.tags,
                    status: shopifyProduct.status,
                    admin_graphql_api_id: shopifyProduct.admin_graphql_api_id,
                    options: shopifyProduct.options,
                    images: shopifyProduct.images,
                    main_image_src: shopifyProduct.images?.[0]?.src,
                    main_image_alt: shopifyProduct.images?.[0]?.alt,
                    price: shopifyProduct.variants?.[0]?.price,
                    compare_at_price: shopifyProduct.variants?.[0]?.compare_at_price,
                    sku: shopifyProduct.variants?.[0]?.sku,
                    // variants: shopifyProduct.variants,
                    inventory_quantity: shopifyProduct.variants?.reduce((sum, v) => sum + v.inventory_quantity, 0),
                    shopify_created_at: shopifyProduct.created_at,
                    shopify_published_at: shopifyProduct.published_at,
                },
                { upsert: true, new: true }
            );

            for (const variant of shopifyProduct.variants) {
                const variantImage = shopifyProduct.images?.find(img => img.id === variant.image_id);
                await ProductVariant.findOneAndUpdate(
                    { shopify_variant_id: variant.id },
                    {
                        product_id: product._id,
                        shopify_product_id: variant.product_id,
                        variant_image_id: variant.image_id,
                        image_src: variantImage?.src || null,
                        sku: variant.sku,
                        grams: variant.grams,
                        price: variant.price,
                        title: variant.title,
                        weight: variant.weight,
                        barcode: variant.barcode,
                        option1: variant.option1,
                        option2: variant.option2,
                        option3: variant.option3,
                        taxable: variant.taxable,
                        position: variant.position,
                        shopify_created_at: variant.created_at,
                        shopify_updated_at: variant.updated_at,
                        weight_unit: variant.weight_unit,
                        compare_at_price: variant.compare_at_price,
                        inventory_policy: variant.inventory_policy,
                        inventory_item_id: variant.inventory_item_id,
                        requires_shipping: variant.requires_shipping,
                        inventory_quantity: variant.inventory_quantity,
                        fulfillment_service: variant.fulfillment_service,
                        admin_graphql_api_id: variant.admin_graphql_api_id,
                        inventory_management: variant.inventory_management,
                        old_inventory_quantity: variant.old_inventory_quantity,
                    },
                    { upsert: true, new: true }
                );
            }
        }

        res.json({ message: 'Products synced successfully', totalProducts: allProducts.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
