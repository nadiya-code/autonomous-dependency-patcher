const express = require("express");
const { createScan, listScans, getScan, createPatch } = require("../controllers/scanController");
const auth = require("../middleware/auth");
const { scanLimiter, patchLimiter, onePatchAtATime } = require("../middleware/limits");

const router = express.Router();

router.post("/", auth, scanLimiter, createScan);
router.get("/", auth, listScans);
router.get("/:id", auth, getScan);
router.post("/:id/patch", auth, patchLimiter, onePatchAtATime, createPatch);

module.exports = router;
