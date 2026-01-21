const express = require('express');
const router = express.Router();
const getProductsController = require('../controllers/getProductsController');

router.get('/products', getProductsController.getProducts);

module.exports = router;
