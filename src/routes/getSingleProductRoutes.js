const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/apiKeyAuth');
const getSingleProductController = require('../controllers/getSingleProductController');

// Supports: /api/single/product?id=123
router.get('/product', authMiddleware, getSingleProductController.getSingleProductApi);

// Backwards-compatible: /api/single/product/123
router.get('/product/:id', authMiddleware, getSingleProductController.getSingleProductApi);
module.exports = router;
