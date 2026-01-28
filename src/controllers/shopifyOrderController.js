const axios = require('axios');
const Order = require('../models/Order');
const OrderLineItem = require('../models/OrderLineItem');
const ProductVariant = require('../models/ProductVariant');

exports.syncShopifyOrders = async (req, res, next) => {
  try {
    const startedAt = Date.now();
    const baseUrl = process.env.SHOPIFY_API_URL;

    let nextUrl = `${baseUrl}/orders.json?status=any&limit=250`;
    let allOrders = [];
    let page = 0;

    while (nextUrl) {
      page += 1;
      const response = await axios.get(nextUrl, {
        headers: {
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        }
      });

      const orders = response.data.orders || [];
      allOrders.push(...orders);

      const linkHeader = response.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
        nextUrl = match ? match[1] : null;
      } else {
        nextUrl = null;
      }
    }

    const total = allOrders.length;
    for (let i = 0; i < total; i++) {
      const shopifyOrder = allOrders[i];

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

    res.json({
      success: true,
      status: 200,
      message: 'Orders synced successfully',
      data: {
        totalOrders: allOrders.length,
        pagesFetched: page,
        durationMs,
      }
    });

  } catch (error) {
    next(error);
  }
};


const getProductIdAndImage = async (variantId) => {
  const variant = await ProductVariant.findOne({ shopify_variant_id: variantId });

  if (!variant) {
    return {};
  }

  return {
    product_id: variant.product_id,
    image_src: variant.image_src,
  };
};
