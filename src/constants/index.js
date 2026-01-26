// Centralized Constants Export

const { COLLECTION_TAGS, TAG_TYPES } = require('./tags');
const { HTTP_STATUS, DB_CONSTANTS, PAGINATION } = require('./appConstants');
const appStrings = require('./appStrings');

module.exports = {
  // Tags
  COLLECTION_TAGS,
  TAG_TYPES,
  
  // App Constants
  HTTP_STATUS,
  DB_CONSTANTS,
  PAGINATION,
  
  // Strings
  ...appStrings,
};
