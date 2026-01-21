const express = require('express');
const router = express.Router();
const shopifyDiscountController = require('../controllers/shopifyDiscountController');

router.get(
  '/sync-discount-codes',
  shopifyDiscountController.syncShopifyDiscountCodes
);

module.exports = router;
