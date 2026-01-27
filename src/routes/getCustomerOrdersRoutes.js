const express = require("express");
const router = express.Router();
const {
  getShopifyCustomerOrders,
  getShopifyCustomerOrdersFromAPI,
} = require("../controllers/getCustomerOrdersController");

router.get("/customer", getShopifyCustomerOrders);
router.get("/customer/shopify-api", getShopifyCustomerOrdersFromAPI);

module.exports = router;
