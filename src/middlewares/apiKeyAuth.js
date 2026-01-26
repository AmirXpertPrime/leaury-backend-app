const { API_MESSAGES } = require("../constants/appConstants");

module.exports = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      message: API_MESSAGES.API_KEY_MISSING,
      status: 401,
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      message: API_MESSAGES.INVALID_API_KEY,
      status: 403,
    });
  }

  next();
};
