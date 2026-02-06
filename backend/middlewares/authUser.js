const jwt = require('jsonwebtoken');

const authUser = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized - Please login"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({
      success: false,
      message: "Not Authorized - " + error.message
    });
  }
};

module.exports = authUser;
