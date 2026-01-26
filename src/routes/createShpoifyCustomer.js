const express = require('express');
const router = express.Router();
const createShopifyUserController = require('../controllers/createShopifyUserController');

router.post('/create', createShopifyUserController.createShopifyUser);

module.exports = router;
