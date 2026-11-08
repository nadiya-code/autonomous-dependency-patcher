const express = require("express");
const { getStats, getVulnerabilities, getPullRequests } = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/stats", auth, getStats);
router.get("/vulnerabilities", auth, getVulnerabilities);
router.get("/pull-requests", auth, getPullRequests);

module.exports = router;
