const axios = require("axios");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const { getPagination } = require("../utils/helper");

exports.getShopifyCustomerOrders = async (req, res) => {
  try {
    const { customerId, shopifyCustomerId } = req.query;
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });

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
      orders: paginatedOrders,
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
