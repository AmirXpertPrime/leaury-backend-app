const { VALIDATION } = require("../constants");
const validator = require("validator");

function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTagContainsRegex(tag) {
  const trimmed = String(tag || "").trim();
  if (!trimmed) return null;
  // Shopify tags are commonly stored as comma-separated text: "Tag A, Tag B"
  // Match whole-tag boundaries around commas (but still tolerate extra spaces).
  return new RegExp(`(?:^|,\\s*)${escapeRegex(trimmed)}(?:\\s*,|$)`, "i");
}

function getPagination({ page }, { defaultLimit = 10 } = {}) {
  const parsedPage = parseInt(page, 10);
  const safePage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = defaultLimit;
  const skip = (safePage - 1) * limit;
  return { page: safePage, limit, skip };
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

function normalizeMinMax(minValue, maxValue) {
  let min = parseOptionalNumber(minValue);
  let max = parseOptionalNumber(maxValue);

  if (min !== null && max !== null && min > max) {
    [min, max] = [max, min];
  }

  return { min, max, hasFilter: min !== null || max !== null };
}

function priceToNumberExpr(fieldPath = "$price") {
  return {
    $convert: {
      input: fieldPath,
      to: "double",
      onError: null,
      onNull: null,
    },
  };
}

function priceRangeExpr({
  fieldPath = "$price",
  minPrice = null,
  maxPrice = null,
} = {}) {
  const priceAsNumber = priceToNumberExpr(fieldPath);
  const parts = [{ $ne: [priceAsNumber, null] }];

  if (minPrice !== null) parts.push({ $gte: [priceAsNumber, minPrice] });
  if (maxPrice !== null) parts.push({ $lte: [priceAsNumber, maxPrice] });

  return { $expr: { $and: parts } };
}

function unpackFacetResult(facetResult) {
  const first = facetResult?.[0] || {};
  const total = Array.isArray(first.total) ? first.total : [];
  const totalCount = total?.[0]?.count || 0;
  return { data: first.data || [], totalCount };
}

function emailRequired(email, res) {
  if (!email) {
    res.status(400).json({
      status: 400,
      message: VALIDATION.EMAIL_REQUIRED,
    });
    return false;
  }
  return true;
}

function phoneRequired(phone, res) {
  if (!phone) {
    res.status(400).json({
      status: 400,
      message: VALIDATION.PHONE_REQUIRED,
    });
    return false;
  }
  return true;
}

function validateEmail(email, res) {
  if (!validator.isEmail(email)) {
    res.status(400).json({
      status: 400,
      message: VALIDATION.INVALID_EMAIL,
    });
    return false;
  }
  return true;
}

module.exports = {
  escapeRegex,
  buildTagContainsRegex,
  getPagination,
  parseOptionalNumber,
  normalizeMinMax,
  priceToNumberExpr,
  priceRangeExpr,
  unpackFacetResult,
  emailRequired,
  phoneRequired,
  validateEmail,
};
