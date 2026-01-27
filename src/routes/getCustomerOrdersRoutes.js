const express = require("express");
const router = express.Router();
const {
  getShopifyCustomerOrders,
  getShopifyCustomerOrdersFromAPI,
} = require("../controllers/getCustomerOrdersController");
const authMiddleware = require("../middlewares/apiKeyAuth");

router.get("/customer", authMiddleware, getShopifyCustomerOrders);
router.get("/customer/shopify-api", getShopifyCustomerOrdersFromAPI);

module.exports = router;
