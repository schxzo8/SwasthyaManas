const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const slot = require("../controllers/slotController");

router.post("/", protect, authorizeRoles("expert"), slot.createSlots);
router.get("/expert/me", protect, authorizeRoles("expert"), slot.listMySlots);
router.get("/expert/:expertId", protect, slot.listExpertSlots);

// hold only
router.post("/:slotId/hold", protect, authorizeRoles("user"), slot.holdSlot);

// confirm
router.post("/:slotId/confirm", protect, authorizeRoles("user"), slot.confirmSlot);
module.exports = router;
