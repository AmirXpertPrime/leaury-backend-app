const axios = require("axios");
const { validateEmail, validatePhone, validateRequired } = require("../utils/validators");
const Customer = require("../models/Customer");
const { ERROR, SUCCESS } = require("../constants/appStrings");

const handleShopifyError = (error) => {
  const shopifyErrors = error.response?.data?.errors;

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

  const error_obj = new Error(friendlyMessage);
  error_obj.status = statusCode;
  throw error_obj;
};

const updateLocalCustomer = async (userId, shopifyCustomer) => {
  return await Customer.findByIdAndUpdate(userId, {
    first_name: shopifyCustomer.first_name || null,
    last_name: shopifyCustomer.last_name || null,
    email: shopifyCustomer.email,
    phone: shopifyCustomer.phone || null,
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
    first_name: shopifyCustomer.first_name || null,
    last_name: shopifyCustomer.last_name || null,
    email: shopifyCustomer.email,
    phone: shopifyCustomer.phone || null,
    address1: shopifyCustomer.default_address?.address1 || null,
    city: shopifyCustomer.default_address?.city || null,
    province: shopifyCustomer.default_address?.province || null,
    country: shopifyCustomer.default_address?.country || null,
    zip: shopifyCustomer.default_address?.zip || null,
  });
};

exports.createShopifyUser = async (req, res, next) => {
  try {
    const payload = req.body.customer || req.body;
    const { first_name, last_name, email, phone } = payload;

    // Validate required fields
    const validatedEmail = validateEmail(email);
    validatePhone(phone);

    // Check if customer already exists
    const existingUser = await Customer.findOne({ email: validatedEmail });
    if (existingUser) {
      req.user = existingUser;
      return exports.updateShopifyUser(req, res, next);
    }

    const customer = {
      email: validatedEmail,
      ...(first_name && { first_name: validateRequired(first_name, "First name") }),
      ...(last_name && { last_name: validateRequired(last_name, "Last name") }),
      ...(phone && { phone: validatePhone(phone) }),
    };

    const response = await axios.post(
      `${process.env.SHOPIFY_API_URL}/customers.json`,
      { customer },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      },
    );

    const shopifyCustomer = response.data.customer;
    if (shopifyCustomer) {
      await createLocalCustomer(shopifyCustomer);
    }

    res.status(201).json({
      success: true,
      status: 201,
      message: SUCCESS.USER_CREATED,
    });
  } catch (error) {
    // Handle Shopify API errors
    if (error.response?.data?.errors) {
      return next(handleShopifyError(error));
    }
    next(error);
  }
};

exports.updateShopifyUser = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const payload = req.body.customer || req.body;
    const { first_name, last_name, email, phone } = payload;

    const shopifyCustomerId = user.shopify_customer_id;

    const customer = {
      id: shopifyCustomerId,
      ...(first_name && { first_name: validateRequired(first_name, "First name") }),
      ...(last_name && { last_name: validateRequired(last_name, "Last name") }),
      ...(email && { email: validateEmail(email) }),
      ...(phone && { phone: validatePhone(phone) }),
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

    const updated = response.data.customer;
    await updateLocalCustomer(user._id, updated);

    res.status(200).json({
      success: true,
      status: 200,
      message: SUCCESS.CUSTOMER_UPDATED,
    });
  } catch (error) {
    // Handle Shopify API errors
    if (error.response?.data?.errors) {
      return next(handleShopifyError(error));
    }
    next(error);
  }
};
