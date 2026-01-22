const express = require('express');
const router = express.Router();
const getProductsApiController = require('../controllers/getProductsApiController');
const authMiddleware = require('../middlewares/apiKeyAuth');


router.get('/products', authMiddleware, getProductsApiController.getProductsApi);
module.exports = router;
