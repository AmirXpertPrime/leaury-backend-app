const express = require('express');
const router = express.Router();
const getProductsApiController = require('../controllers/getProductsApiController');
const getRecommendedProductsController = require('../controllers/getRecommendedProductsController');
const authMiddleware = require('../middlewares/apiKeyAuth');


router.get('/products', authMiddleware, getProductsApiController.getProductsApi);
router.get('/recommended-products', authMiddleware, getRecommendedProductsController.getRecommendedProductsApi);
module.exports = router;
