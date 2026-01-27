const express = require("express");
const router = express.Router();
const {
  deleteCustomerApi,
} = require("../controllers/deleteCustomerController");
const authMiddleware = require("../middlewares/apiKeyAuth");

router.delete("/delete", authMiddleware, deleteCustomerApi);

module.exports = router;
