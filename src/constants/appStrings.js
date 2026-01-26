// Application Strings & Messages

const APP_STRINGS = {
  // Success Messages
  SUCCESS: {
    PRODUCT_FETCHED: "Product fetched successfully",
    PRODUCTS_FETCHED: "Products fetched successfully",
    CATEGORIES_FETCHED: "Categories fetched successfully",
    ORDER_CREATED: "Order created successfully",
    USER_CREATED: "User created successfully",
    CUSTOMER_UPDATED: "Customer updated successfully",
  },

  // Error Messages
  ERROR: {
    PRODUCT_NOT_FOUND: "Product not found",
    INVALID_API_KEY: "Invalid API key",
    UNAUTHORIZED: "Unauthorized access",
    INTERNAL_ERROR: "Internal server error",
    FAILED_TO_PROCESS: "Failed to process request",
    FAILED_TO_CREATE_USER: "Failed to create Shopify user",
    FAILED_TO_UPDATE_USER: "Failed to update Shopify user",
    EMAIL_ALREADY_EXISTS: "Email already exists.",
    PHONE_ALREADY_EXISTS: "Phone number already exists.",
    INVALID_PHONE: "The phone number is invalid.",
  },

  // Validation Messages
  VALIDATION: {
    INVALID_INPUT: "Invalid input provided",
    MISSING_REQUIRED_FIELD: "Missing required field",
    EMAIL_REQUIRED: "Email is required",
    PHONE_REQUIRED: "Phone number is required",
    INVALID_EMAIL: "Invalid email format",
  },
};

module.exports = APP_STRINGS;
