const express = require('express');
const router = express.Router();

const { getCategoriesApi } = require('../controllers/getCategoriesApiController');

// Standalone endpoint (not part of products router)
router.get('/', getCategoriesApi);

module.exports = router;


