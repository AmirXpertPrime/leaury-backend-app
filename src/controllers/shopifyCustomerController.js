const axios = require('axios');
const Customer = require('../models/Customer');

exports.syncShopifyCustomers = async (req, res) => {
    try {
        const baseUrl = process.env.SHOPIFY_API_URL;

        // 1️⃣ Initial URL (Shopify default page size = 50)
        let nextUrl = `${baseUrl}/customers.json`;
        let allCustomers = [];

        // 2️⃣ Pagination loop
        while (nextUrl) {
            const response = await axios.get(nextUrl, {
                headers: {
                    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
                    'Content-Type': 'application/json',
                    'User-Agent': 'MyApp/1.0',
                }
            });

            const customers = response.data.customers || [];
            console.log(`Fetched ${customers.length} customers`);

            allCustomers.push(...customers);

            // 3️⃣ Parse Link header
            const linkHeader = response.headers.link;
            if (linkHeader && linkHeader.includes('rel="next"')) {
                const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                nextUrl = match ? match[1] : null;
            } else {
                nextUrl = null;
            }
        }

        console.log(`TOTAL CUSTOMERS FETCHED: ${allCustomers.length}`);

        // 4️⃣ Save customers
        for (const shopifyCustomer of allCustomers) {
            await Customer.findOneAndUpdate(
                { shopify_customer_id: shopifyCustomer.id },
                {
                    first_name: shopifyCustomer.first_name ?? null,
                    last_name: shopifyCustomer.last_name ?? null,
                    email: shopifyCustomer.email ?? null,
                    phone: shopifyCustomer.phone ?? null,
                    address1: shopifyCustomer.default_address?.address1 ?? null,
                    city: shopifyCustomer.default_address?.city ?? null,
                    province: shopifyCustomer.default_address?.province ?? null,
                    zip: shopifyCustomer.default_address?.zip ?? null,
                    country: shopifyCustomer.default_address?.country ?? null,
                },
                { upsert: true, new: true }
            );
        }

        return res.json({
            message: 'Customers synced successfully',
            total_customers: allCustomers.length
        });

    } catch (error) {
        console.error('Customer Sync Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
