// Application Constants

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// API Messages
const API_MESSAGES = {
  SUCCESS: "Success",
  ERROR: "Error",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  INVALID_API_KEY: "Invalid API key",
};

// Database Constants
const DB_CONSTANTS = {
  CONNECTION_TIMEOUT: 5000,
  POOL_SIZE: 10,
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  HTTP_STATUS,
  API_MESSAGES,
  DB_CONSTANTS,
  PAGINATION,
};
