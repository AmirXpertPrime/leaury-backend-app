const express = require('express');
const router = express.Router();
const shopifyCustomerController = require('../controllers/shopifyCustomerController');

router.get(
  '/sync-customers',
  shopifyCustomerController.syncShopifyCustomers
);

module.exports = router;
