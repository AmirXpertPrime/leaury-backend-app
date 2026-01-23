const express = require('express');
const router = express.Router();
const getProductsApiController = require('../controllers/getProductsApiController');
const getRecommendedProductsController = require('../controllers/getRecommendedProductsController');
const getNewArrivalsController = require('../controllers/getNewArrivalsController');
const authMiddleware = require('../middlewares/apiKeyAuth');


router.get('/products', authMiddleware, getProductsApiController.getProductsApi);
router.get('/recommended-products', authMiddleware, getRecommendedProductsController.getRecommendedProductsApi);
router.get('/new-arrivals', authMiddleware, getNewArrivalsController.getNewArrivalsApi);
module.exports = router;
