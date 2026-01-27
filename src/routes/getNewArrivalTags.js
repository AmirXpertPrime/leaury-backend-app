const express = require("express");
const router = express.Router();
const getNewArrivalsTagsController = require("../controllers/getNewArrivalsTagsController");
const authMiddleware = require("../middlewares/apiKeyAuth");

router.get(
  "/tags",
  authMiddleware,
  getNewArrivalsTagsController.getNewArrivalsTags,
);
router.post(
  "/tags",
  authMiddleware,
  getNewArrivalsTagsController.getNewArrivalsTags,
);

module.exports = router;
