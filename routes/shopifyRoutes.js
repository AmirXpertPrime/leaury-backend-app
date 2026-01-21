const express = require('express');
const router = express.Router();
const shopifyController = require('../controllers/shopifyController');

router.get('/sync-products', shopifyController.syncShopifyProducts);

module.exports = router;
