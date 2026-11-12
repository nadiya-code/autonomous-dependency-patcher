require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  const email = (process.env.OWNER_EMAIL || "").toLowerCase().trim();
  if (!email) {
    console.error("Set OWNER_EMAIL.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.error("No account with that email. Register first.");
    process.exit(1);
  }
  await User.updateMany({ _id: { $ne: user._id } }, { $set: { isOwner: false } });
  await User.updateOne({ _id: user._id }, { $set: { isOwner: true, isPlatformAdmin: true, disabled: false } });
  console.log("Owner set:", user.email);
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
