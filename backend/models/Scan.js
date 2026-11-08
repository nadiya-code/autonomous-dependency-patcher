const mongoose = require("mongoose");

const vulnSchema = new mongoose.Schema(
  {
    packageName: String,
    installedVersion: String,
    direct: Boolean,
    folder: String,
    vulnerabilityId: String,
    summary: String,
    severity: { type: String, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"] },
    fixedVersions: [String],
  },
  { _id: false }
);

const scanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    repoFullName: String,
    status: { type: String, enum: ["running", "completed", "failed"], default: "running" },
    source: String,
    packagesScanned: Number,
    vulnCount: { type: Number, default: 0 },
    vulnerabilities: [vulnSchema],
    error: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", scanSchema);

