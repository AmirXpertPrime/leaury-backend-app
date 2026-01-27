const express = require("express");
const router = express.Router();
const {
  deleteCustomerApi,
} = require("../controllers/deleteCustomerController");

router.delete("/delete", deleteCustomerApi);

module.exports = router;
