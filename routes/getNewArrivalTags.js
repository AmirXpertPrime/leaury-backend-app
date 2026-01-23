const express = require('express');
const router = express.Router();
const getNewArrivalsTagsController = require('../controllers/getNewArrivalsTagsController');

router.get('/tags', getNewArrivalsTagsController.getNewArrivalsTags);
router.post('/tags', getNewArrivalsTagsController.getNewArrivalsTags);

module.exports = router;
