// server.js
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const apiKeyAuth = require("./middlewares/apiKeyAuth");

// Route imports
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
const deleteCustomerProfileRoutes = require("./routes/deleteCustomerProfile");

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "SHOPIFY_API_URL", "SHOPIFY_ACCESS_TOKEN", "API_KEY"];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
  process.exit(1);
}

const app = express();

// Middleware - Security & Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static images
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// Connect to MongoDB
connectDB();

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "✅ Server is running" });
});

// Public routes (no API key required)
app.use("/api/get/categories", categoriesRoutes);
app.use("/api/get", getProductsRoutes);
app.use("/api/single", getSingleProductRoutes);
app.use("/api/new-arrival", getNewArrivalTagsRoutes);
app.use("/api/customer/create", createShopifyUserRoutes);

// Protected routes (API key required)
app.use("/api/shopify", apiKeyAuth, shopifyRoutes);
app.use("/api/shopify-order", apiKeyAuth, shopifyOrderRoutes);
app.use("/api/shopify-discount", apiKeyAuth, shopifyDiscountRoutes);
app.use("/api/shopify-customer", apiKeyAuth, shopifyCustomerRoutes);
app.use("/api/order", apiKeyAuth, getCustomerOrdersRoutes);
app.use("/api/customer/delete", apiKeyAuth, deleteCustomerProfileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: "Endpoint not found",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
