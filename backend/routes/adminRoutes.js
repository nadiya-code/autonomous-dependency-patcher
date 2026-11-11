const express = require("express");
const { getStats, listUsers, setDisabled, listScans } = require("../controllers/adminController");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const router = express.Router();

router.use(auth, adminOnly);
router.get("/stats", getStats);
router.get("/users", listUsers);
router.patch("/users/:id", setDisabled);
router.get("/scans", listScans);

module.exports = router;
