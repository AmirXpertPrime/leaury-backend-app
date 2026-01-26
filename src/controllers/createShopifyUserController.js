exports.createShopifyUser = async (req, res) => {
    try {


       
        let payload = {
            name: req.body.name,
            email: req.body.email,
            
        }

        // const response = await axios.post(`${process.env.SHOPIFY_API_URL}/customers.json`, payload, {
        //     headers: {
        //         'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        //         'Content-Type': 'application/json',
        //     },
        // });


        res.status(200).json({
            message: 'Shopify User created successfully',
            status: 200,
            data: req.body,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: 500 });
    }
};