require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Platform Admin";

  if (!email || password.length < 12) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters).");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { isPlatformAdmin: true, disabled: false, password: hashed }, $setOnInsert: { name } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Admin ready:", user.email);
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
