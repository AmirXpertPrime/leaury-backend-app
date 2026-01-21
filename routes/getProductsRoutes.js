const express = require('express');
const router = express.Router();
const getProductsApiController = require('../controllers/getProductsApiController');

router.get('/products', getProductsApiController.getProductsApi);
module.exports = router;
