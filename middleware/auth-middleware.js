const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const { authToken } = req.cookies;

  // console.log(req.cookies);

  try {
    const userVerified = jwt.verify(authToken, process.env.JWT_SIGN);

    const { _id: userId, user_name } = userVerified;

    req.user = { userId, user_name };

    next();
  } catch (error) {
    res.status(400).json({ msg: "Unauthorized to access this route " });
  }
};

module.exports = authMiddleware;
