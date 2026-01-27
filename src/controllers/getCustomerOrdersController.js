const axios = require("axios");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const OrderLineItem = require("../models/OrderLineItem");
const { getPagination } = require("../utils/helper");

// Fetch orders from database with pagination
exports.getShopifyCustomerOrders = async (req, res) => {
  try {
    const { customerId, shopifyCustomerId } = req.query;
    const { page, limit, skip } = getPagination(req.query, {
      defaultLimit: 10,
    });

    let shopifyId = null;

    // Try to get shopifyCustomerId from different sources
    if (shopifyCustomerId) {
      const idNum = Number(shopifyCustomerId);
      if (Number.isFinite(idNum)) {
        shopifyId = idNum;
      }
    }

    if (!shopifyId && customerId) {
      let user = null;

      if (mongoose.Types.ObjectId.isValid(customerId)) {
        user = await Customer.findById(customerId);
      } else {
        const idNum = Number(customerId);
        if (Number.isFinite(idNum)) {
          user = await Customer.findOne({ shopify_customer_id: idNum });
        }
      }

      if (user && user.shopify_customer_id) {
        shopifyId = user.shopify_customer_id;
      }
    }

    if (!shopifyId) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get total count of orders for this customer
    const totalOrders = await Order.countDocuments({
      shopify_customer_id: shopifyId,
    });

    const orders = await Order.find({
      shopify_customer_id: shopifyId,
    })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch line items for all orders in this page
    const orderIds = orders.map((order) => order._id);
    const lineItems = await OrderLineItem.find({
      order_id: { $in: orderIds },
    }).lean();

    // Group line items by order_id
    const lineItemsByOrderId = {};
    lineItems.forEach((item) => {
      const orderId = item.order_id.toString();
      if (!lineItemsByOrderId[orderId]) {
        lineItemsByOrderId[orderId] = [];
      }
      lineItemsByOrderId[orderId].push(item);
    });

    // Attach line items to each order
    const ordersWithLineItems = orders.map((order) => ({
      ...order,
      line_items: lineItemsByOrderId[order._id.toString()] || [],
    }));

    return res.status(200).json({
      status: 200,
      data: ordersWithLineItems,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error(
      "❌ Shopify Orders Error:",
      error.response?.data || error.message,
    );

    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: "Failed to fetch customer orders",
    });
  }
};

// Fetch orders directly from Shopify API
exports.getShopifyCustomerOrdersFromAPI = async (req, res) => {
  try {
    const { customerId, shopifyCustomerId } = req.query;
    const { page, limit, skip } = getPagination(req.query, {
      defaultLimit: 10,
    });

    let user = null;
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      user = await Customer.findById(customerId);
    }

    if (!user && shopifyCustomerId) {
      const idNum = Number(shopifyCustomerId);
      if (Number.isFinite(idNum)) {
        user = await Customer.findOne({ shopify_customer_id: idNum });
      }
    }

    if (!user && customerId && !mongoose.Types.ObjectId.isValid(customerId)) {
      const idNum = Number(customerId);
      if (Number.isFinite(idNum)) {
        user = await Customer.findOne({ shopify_customer_id: idNum });
      }
    }

    if (!user || !user.shopify_customer_id) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const response = await axios.get(
      `${process.env.SHOPIFY_API_URL}/customers/${user.shopify_customer_id}/orders.json?status=any&limit=250`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      },
    );

    const allOrders = response.data.orders || [];
    const totalOrders = allOrders.length;
    const paginatedOrders = allOrders.slice(skip, skip + limit);

    return res.status(200).json({
      status: 200,
      data: paginatedOrders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error(
      "❌ Shopify Orders Error:",
      error.response?.data || error.message,
    );

    return res.status(error.response?.status || 500).json({
      status: error.response?.status || 500,
      message: "Failed to fetch customer orders",
    });
  }
};
