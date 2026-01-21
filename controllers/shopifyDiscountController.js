const axios = require('axios');
const DiscountPriceRule = require('../models/DiscountPriceRule');
const DiscountCode = require('../models/DiscountCode');

// 🔹 Generic Shopify GET with pagination (limit = 50)
const shopifyGetAll = async (endpoint) => {
    const baseUrl = process.env.SHOPIFY_API_URL;
    let nextUrl = `${baseUrl}${endpoint}?limit=50`;
    let allData = [];

    while (nextUrl) {
        const response = await axios.get(nextUrl, {
            headers: {
                'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json',
            }
        });

        // Detect key dynamically (price_rules or discount_codes)
        const dataKey = Object.keys(response.data)[0];
        const data = response.data[dataKey] || [];
        allData.push(...data);

        const linkHeader = response.headers.link;
        if (linkHeader && linkHeader.includes('rel="next"')) {
            const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
            nextUrl = match ? match[1] : null;
        } else {
            nextUrl = null;
        }
    }

    return allData;
};

exports.syncShopifyDiscountCodes = async (req, res) => {
    try {
        // 1️⃣ Fetch ALL price rules
        const rules = await shopifyGetAll('/price_rules.json');
        console.log(`Fetched ${rules.length} price rules`);

        for (const rule of rules) {

            // 2️⃣ Upsert price rule
            const discountPriceRule = await DiscountPriceRule.findOneAndUpdate(
                { shopify_price_rule_id: rule.id },
                {
                    title: rule.title,
                    value_type: rule.value_type,
                    value: rule.value,
                    target_type: rule.target_type,
                    target_selection: rule.target_selection,
                    starts_at: rule.starts_at,
                    ends_at: rule.ends_at || null,
                },
                { upsert: true, new: true }
            );

            // 3️⃣ Fetch ALL discount codes for this rule (paginated)
            const codes = await shopifyGetAll(
                `/price_rules/${rule.id}/discount_codes.json`
            );

            console.log(
                `Fetched ${codes.length} discount codes for rule ${rule.id}`
            );

            // 4️⃣ Save discount codes
            for (const code of codes) {
                await DiscountCode.findOneAndUpdate(
                    { shopify_discount_code_id: code.id },
                    {
                        discount_price_rule_id: discountPriceRule._id,
                        code: code.code,
                        usage_count: code.usage_count || 0,
                        max_usage: code.usage_limit || null,
                    },
                    { upsert: true, new: true }
                );
            }
        }

        return res.json({
            message: 'Discount codes synced successfully',
            total_price_rules: rules.length
        });

    } catch (error) {
        console.error('Discount Sync Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
