const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash });
    await user.save();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jid", refreshToken, { httpOnly: true, path: "/api/auth/refresh-token" });
    res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "All fields required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jid", refreshToken, { httpOnly: true, path: "/api/auth/refresh-token" });
    res.json({ user: { id: user._id, name: user.name, email: user.email }, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.status(401).json({ message: "Refresh token missing" });
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token) return res.status(401).json({ message: "Invalid refresh token" });

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("jid", newRefreshToken, { httpOnly: true, path: "/api/auth/refresh-token" });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.jid;
    if (token) {
      const payload = jwt.decode(token);
      if (payload && payload.id) {
        await User.findByIdAndUpdate(payload.id, { $unset: { refreshToken: "" } });
      }
    }
    res.clearCookie("jid", { path: "/api/auth/refresh-token" });
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
