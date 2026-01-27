const express = require("express");
const router = express.Router();
const { getShopifyCustomerOrders } = require("../controllers/getCustomerOrdersController");

router.get("/customer", getShopifyCustomerOrders);

module.exports = router;
