const express = require('express');
const router = express.Router();
const shopifyOrderController = require('../controllers/shopifyOrderController');

router.get('/sync-orders', shopifyOrderController.syncShopifyOrders);

module.exports = router;
