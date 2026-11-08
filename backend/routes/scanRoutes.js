const express = require("express");
const { createScan, listScans, getScan } = require("../controllers/scanController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, createScan);
router.get("/", auth, listScans);
router.get("/:id", auth, getScan);

module.exports = router;
