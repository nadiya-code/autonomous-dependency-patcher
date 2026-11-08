const express = require("express");
const { createScan, listScans, getScan, createPatch } = require("../controllers/scanController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, createScan);
router.get("/", auth, listScans);
router.get("/:id", auth, getScan);
router.post("/:id/patch", auth, createPatch);

module.exports = router;
