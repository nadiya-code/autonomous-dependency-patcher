const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  isPlatformAdmin: !!u.isPlatformAdmin,
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ token: createToken(user._id), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: (email || "").toLowerCase() });
    const valid = user && (await bcrypt.compare(password || "", user.password));

    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.disabled) {
      return res.status(403).json({ message: "This account has been disabled." });
    }

    res.json({ token: createToken(user._id), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
