module.exports = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    

    if (!apiKey) {
        return res.status(401).json({
            message: 'API key missing',
            status: 401,
        });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            message: 'Invalid API key',
            status: 403,
        });
    }

    next();
};
