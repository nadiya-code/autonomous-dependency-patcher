const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["admin", "member"], default: "admin" },
    githubLogin: { type: String }, githubInstallationId: { type: Number }, isPlatformAdmin: { type: Boolean, default: false }, disabled: { type: Boolean, default: false },
    githubToken: { type: String, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);


