const axios = require('axios');
const Order = require('../models/Order');
const OrderLineItem = require('../models/OrderLineItem');
const ProductVariant = require('../models/ProductVariant');

exports.syncShopifyOrders = async (req, res) => {
  try {
    const startedAt = Date.now();
    const baseUrl = process.env.SHOPIFY_API_URL;

    // Shopify REST API paginates results. If you don't pass `limit`, it defaults to 50.
    // We'll fetch all pages using the `Link` header (rel="next"), like product sync.
    let nextUrl = `${baseUrl}/orders.json?status=any&limit=250`;
    let allOrders = [];
    let page = 0;

    console.log('[syncShopifyOrders] Starting order sync...');
    console.log('[syncShopifyOrders] First page URL:', nextUrl);

    while (nextUrl) {
      page += 1;
      console.log(`[syncShopifyOrders] Fetching page ${page}...`);
      const response = await axios.get(nextUrl, {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        }
      });

      const orders = response.data.orders || [];
      console.log(`[syncShopifyOrders] Page ${page} fetched ${orders.length} orders`);
      allOrders.push(...orders);

      const linkHeader = response.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        nextUrl = match ? match[1] : null;
        console.log(`[syncShopifyOrders] Page ${page} next page:`, nextUrl ? 'YES' : 'NO');
      } else {
        nextUrl = null;
        console.log(`[syncShopifyOrders] Page ${page} next page: NO (no Link header)`);
      }
    }

    console.log('[syncShopifyOrders] Total orders fetched:', allOrders.length);
    console.log('[syncShopifyOrders] Starting DB upserts...');

    const total = allOrders.length;
    for (let i = 0; i < total; i++) {
      const shopifyOrder = allOrders[i];
      const shouldLogProgress = i === 0 || (i + 1) % 25 === 0 || i === total - 1;
      if (shouldLogProgress) {
        console.log(
          `[syncShopifyOrders] Upserting order ${i + 1}/${total}`,
          `id=${shopifyOrder.id}`,
          `name=${shopifyOrder.name || 'n/a'}`,
          `line_items=${shopifyOrder.line_items?.length ?? 0}`
        );
      }

      // 🔹 Order upsert
      const order = await Order.findOneAndUpdate(
        { shopify_order_id: shopifyOrder.id },
        {
          shopify_customer_id: shopifyOrder.customer?.id || null,
          name: shopifyOrder.name || null,
          order_number: shopifyOrder.order_number || null,
          financial_status: shopifyOrder.financial_status || null,
          order_status_url: shopifyOrder.order_status_url || null,
          processed_at: shopifyOrder.processed_at || null,
          confirmation_number: shopifyOrder.confirmation_number || null,
          confirmed: shopifyOrder.confirmed || null,
          subtotal_price: shopifyOrder.subtotal_price || null,
          total_discounts: shopifyOrder.total_discounts || null,
          total_price: shopifyOrder.total_price || null,
        },
        { upsert: true, new: true }
      );

      // 🔹 Line items
      for (const item of shopifyOrder.line_items) {
        const data = await getProductIdAndImage(item.variant_id);

        await OrderLineItem.findOneAndUpdate(
          { line_item_id: item.id },
          {
            order_id: order._id,
            shopify_order_id: order.shopify_order_id,
            name: item.name || null,
            title: item.title || null,
            price: item.price || null,
            quantity: item.quantity || null,
            sku: item.sku || null,
            variant_id: item.variant_id || null,
            variant_title: item.variant_title || null,
            product_id: data.product_id || null,
            image_src: data.image_src || null,
          },
          { upsert: true, new: true }
        );
      }
    }

    const durationMs = Date.now() - startedAt;
    console.log('[syncShopifyOrders] Done. Duration (ms):', durationMs);

    res.json({
      message: 'Orders synced successfully',
      totalOrders: allOrders.length,
      durationMs,
      pagesFetched: page,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const getProductIdAndImage = async (variantId) => {
  const variant = await ProductVariant.findOne({ shopify_variant_id: variantId });

  if (!variant) {
    console.log(`No ProductVariant found for shopify_variant_id: ${variantId}`);
    return {};
  }

  console.log(`Found ProductVariant: ${variant._id}, Product ID: ${variant.product_id}`);

  return {
    product_id: variant.product_id,
    image_src: variant.image_src,
  };
};
