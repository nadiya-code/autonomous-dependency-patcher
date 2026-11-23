const express = require("express");
const { getConnectUrl, callback, getRepos, disconnect } = require("../controllers/githubController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/connect", auth, getConnectUrl);
router.post("/callback", auth, callback);
router.get("/repos", auth, getRepos);
router.delete("/connection", auth, disconnect);

module.exports = router;
