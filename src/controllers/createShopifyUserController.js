const axios = require("axios");
const {
  emailRequired,
  phoneRequired,
  validateEmail,
} = require("../utils/helper");
const Customer = require("../models/Customer");
const { ERROR, SUCCESS } = require("../constants/appStrings");

const handleShopifyError = (error, res) => {
  const shopifyErrors = error.response?.data?.errors;
  console.error("Shopify Error:", shopifyErrors || error.message);

  let friendlyMessage = ERROR.FAILED_TO_PROCESS;
  let statusCode = error.response?.status || 500;

  if (shopifyErrors?.email?.includes("has already been taken")) {
    friendlyMessage = ERROR.EMAIL_ALREADY_EXISTS;
    statusCode = 409;
  } else if (shopifyErrors?.phone?.includes("has already been taken")) {
    friendlyMessage = ERROR.PHONE_ALREADY_EXISTS;
    statusCode = 409;
  } else if (shopifyErrors?.phone?.length) {
    friendlyMessage = ERROR.INVALID_PHONE;
  }

  return res
    .status(statusCode)
    .json({ status: statusCode, message: friendlyMessage });
};

const updateLocalCustomer = async (userId, shopifyCustomer) => {
  return await Customer.findByIdAndUpdate(userId, {
    first_name: shopifyCustomer.first_name,
    last_name: shopifyCustomer.last_name,
    email: shopifyCustomer.email,
    phone: shopifyCustomer.phone,
    address1: shopifyCustomer.default_address?.address1 || null,
    city: shopifyCustomer.default_address?.city || null,
    province: shopifyCustomer.default_address?.province || null,
    country: shopifyCustomer.default_address?.country || null,
    zip: shopifyCustomer.default_address?.zip || null,
  });
};

const createLocalCustomer = async (shopifyCustomer) => {
  return await Customer.create({
    shopify_customer_id: shopifyCustomer.id,
    first_name: shopifyCustomer.first_name,
    last_name: shopifyCustomer.last_name,
    email: shopifyCustomer.email,
    phone: shopifyCustomer.phone,
    address1: shopifyCustomer.default_address?.address1 || null,
    city: shopifyCustomer.default_address?.city || null,
    province: shopifyCustomer.default_address?.province || null,
    country: shopifyCustomer.default_address?.country || null,
    zip: shopifyCustomer.default_address?.zip || null,
  });
};

exports.createShopifyUser = async (req, res) => {
  try {
    const payload = req.body.customer || req.body;
    const { first_name, last_name, email, phone } = payload;
    const user = await Customer.findOne({ email });
    if (user) {
      console.log("User already exists:", user);
      return await exports.updateShopifyUser(req, res, user);
    }

    console.log("Incoming request:", req.body);

    emailRequired(email, res);
    phoneRequired(phone, res);
    validateEmail(email, res);

    const customer = {
      email,
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(phone && { phone }),
    };

    const shopifyPayload = { customer };

    const response = await axios.post(
      `${process.env.SHOPIFY_API_URL}/customers.json`,
      shopifyPayload,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Shopify Response:", response.data);
    const shopifyCustomer = response.data.customer;
    if (shopifyCustomer) {
      console.log("Created Shopify Customer ID:", shopifyCustomer.id);
      await createLocalCustomer(shopifyCustomer);
    }

    return res.status(201).json({
      status: 201,
      message: SUCCESS.USER_CREATED,
      success: true,
      //data: response.data,
    });
  } catch (error) {
    return handleShopifyError(error, res);
  }
};

exports.updateShopifyUser = async (req, res, user) => {
  try {
    const payload = req.body.customer || req.body;
    const { first_name, last_name, email, phone } = payload;

    const shopifyCustomerId = user.shopify_customer_id;

    const customer = {
      id: shopifyCustomerId,
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(email && { email }),
      ...(phone && { phone }),

      // Example metafield update (same as your cURL)
      metafields: [
        {
          key: "new",
          value: "newvalue",
          type: "single_line_text_field",
          namespace: "global",
        },
      ],
    };

    const response = await axios.put(
      `${process.env.SHOPIFY_API_URL}/customers/${shopifyCustomerId}.json`,
      { customer },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Shopify Update Response:", response.data);

    const updated = response.data.customer;

    // Update mongoDB record
    await updateLocalCustomer(user._id, updated);

    return res.status(200).json({
      status: 200,
      message: SUCCESS.CUSTOMER_UPDATED,
      success: true,
    });
  } catch (error) {
    return handleShopifyError(error, res);
  }
};
