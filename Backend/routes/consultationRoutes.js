const express = require("express");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  createRequest,
  getMyRequests,
  getRequestsForExpert,
  updateRequestStatus,
} = require("../controllers/consultationController");

const router = express.Router();

// user
router.post("/", protect, authorizeRoles("user"), createRequest);
router.get("/my", protect, getMyRequests);

// expert
router.get("/expert", protect, authorizeRoles("expert"), getRequestsForExpert);
router.put("/:id", protect, authorizeRoles("expert"), updateRequestStatus);

module.exports = router;
