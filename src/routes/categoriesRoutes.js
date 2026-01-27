const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/apiKeyAuth");
const {
  getCategoriesApi,
} = require("../controllers/getCategoriesApiController");

router.get("/", authMiddleware, getCategoriesApi);
module.exports = router;
