const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const parts = authHeader.split(" ").filter(Boolean);
  let token;

  if (parts.length === 2) {
    const scheme = parts[0];
    if (!/^Bearer$/i.test(scheme)) {
      return res
        .status(401)
        .json({ message: "Authorization scheme must be Bearer" });
    }
    token = parts[1];
  } else if (parts.length === 1) {
    token = parts[0];
  } else {
    return res
      .status(401)
      .json({ message: "Invalid Authorization header format" });
  }

  if (!token) return res.status(401).json({ message: "Access token missing" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!payload || !payload.id)
      return res.status(401).json({ message: "Invalid token payload" });

    const user = await User.findById(payload.id).select(
      "-passwordHash -refreshToken"
    );
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    return next();
  } catch (err) {
    if (err && err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(401).json({ message: "Invalid access token" });
  }
};

module.exports = { verifyAccessToken };
