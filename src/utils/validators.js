/**
 * Input Validation Utilities
 * Helper functions for validating and sanitizing user input
 */

const validator = require("validator");

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {Error} If email is invalid
 * @returns {string} The email
 */
const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    const error = new Error("Invalid email address");
    error.status = 400;
    throw error;
  }
  return email.toLowerCase().trim();
};

/**
 * Validate phone number (basic format)
 * @param {string} phone - Phone to validate
 * @throws {Error} If phone is invalid
 * @returns {string} The phone
 */
const validatePhone = (phone) => {
  if (!phone) {
    const error = new Error("Phone number is required");
    error.status = 400;
    throw error;
  }

  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length < 10) {
    const error = new Error("Phone number must be at least 10 digits");
    error.status = 400;
    throw error;
  }
  return phone.trim();
};

/**
 * Validate required string field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @throws {Error} If value is empty
 * @returns {string} The trimmed value
 */
const validateRequired = (value, fieldName = "Field") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    const error = new Error(`${fieldName} is required`);
    error.status = 400;
    throw error;
  }
  return trimmed;
};

/**
 * Validate numeric ID (Shopify IDs are numbers)
 * @param {number|string} id - ID to validate
 * @param {string} fieldName - Name of the field for error message
 * @throws {Error} If ID is not a valid positive number
 * @returns {number} The parsed ID
 */
const validateNumericId = (id, fieldName = "ID") => {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    const error = new Error(`${fieldName} must be a positive number`);
    error.status = 400;
    throw error;
  }
  return num;
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @throws {Error} If not a valid MongoDB ObjectId
 * @returns {string} The ID
 */
const validateObjectId = (id) => {
  if (!validator.isMongoId(id)) {
    const error = new Error("Invalid ID format");
    error.status = 400;
    throw error;
  }
  return id;
};

module.exports = {
  validateEmail,
  validatePhone,
  validateRequired,
  validateNumericId,
  validateObjectId,
};
