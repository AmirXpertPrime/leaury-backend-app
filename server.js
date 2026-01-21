// server.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const shopifyRoutes = require('./routes/shopifyRoutes');
const shopifyOrderRoutes = require('./routes/shopifyOrderRoutes');
const shopifyDiscountRoutes = require('./routes/shopifyDiscountRoutes');
const shopifyCustomerRoutes = require('./routes/shopifyCustomerRoutes');
const getProductsRoutes = require('./routes/getProductsRoutes');
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB

connectDB();

app.get("/", (req, res) => {
    res.send("Hello World! ✅ Server is running");
});

app.use('/api/shopify', shopifyRoutes);
app.use('/api/shopify-order', shopifyOrderRoutes);
app.use('/api/shopify-discount', shopifyDiscountRoutes);
app.use('/api/shopify-customer', shopifyCustomerRoutes);
app.use('/api/get-products', getProductsRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
