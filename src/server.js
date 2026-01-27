// server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const shopifyRoutes = require("./routes/shopifyRoutes");
const shopifyOrderRoutes = require("./routes/shopifyOrderRoutes");
const shopifyDiscountRoutes = require("./routes/shopifyDiscountRoutes");
const shopifyCustomerRoutes = require("./routes/shopifyCustomerRoutes");
const createShopifyUserRoutes = require("./routes/createShpoifyCustomer");
const categoriesRoutes = require("./routes/categoriesRoutes");
const getProductsRoutes = require("./routes/getProductsRoutes");
const getSingleProductRoutes = require("./routes/getSingleProductRoutes");
const getNewArrivalTagsRoutes = require("./routes/getNewArrivalTags");
const getCustomerOrdersRoutes = require("./routes/getCustomerOrdersRoutes");
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
// Serve local images from /public/images -> /images/...
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// Connect to MongoDB

connectDB();

app.get("/", (req, res) => {
  res.send("Hello World! ✅ Server is running");
});

app.use("/api/shopify", shopifyRoutes);
app.use("/api/shopify-order", shopifyOrderRoutes);
app.use("/api/shopify-discount", shopifyDiscountRoutes);
app.use("/api/shopify-customer", shopifyCustomerRoutes);
app.use("/api/customer", createShopifyUserRoutes);
// Categories API (keep under /api/get to match existing routing style)
app.use("/api/get/categories", categoriesRoutes);
app.use("/api/get", getProductsRoutes);
app.use("/api/single", getSingleProductRoutes);
app.use("/api/new-arrival", getNewArrivalTagsRoutes);

app.use("/api/order", getCustomerOrdersRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
