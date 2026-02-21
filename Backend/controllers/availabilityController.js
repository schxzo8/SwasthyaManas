const AvailabilitySlot = require("../models/AvailabilitySlot");

// Helper: free expired holds
async function releaseExpiredHolds(expertId) {
  const now = new Date();
  const query = {
    status: "held",
    holdExpiresAt: { $lt: now },
  };
  if (expertId) query.expert = expertId;

  await AvailabilitySlot.updateMany(query, {
    $set: { status: "available", heldBy: null, holdExpiresAt: null },
  });
}

// EXPERT: bulk create slots
// body: { slots: [{ startAt, endAt }, ...] }
exports.bulkCreateSlots = async (req, res) => {
  try {
    const expertId = req.user._id;

    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "slots array is required" });
    }

    // Basic validation
    const docs = slots.map((s) => {
      const startAt = new Date(s.startAt);
      const endAt = new Date(s.endAt);
      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
        throw new Error("Invalid date in slots");
      }
      if (endAt <= startAt) {
        throw new Error("endAt must be after startAt");
      }
      return { expert: expertId, startAt, endAt };
    });

    // Insert many (skip duplicates safely)
    const inserted = await AvailabilitySlot.insertMany(docs, { ordered: false }).catch((err) => {
      // duplicate key errors allowed; still return what inserted
      if (err.writeErrors) return err.insertedDocs || [];
      throw err;
    });

    return res.status(201).json({
      message: "Slots created",
      insertedCount: inserted.length,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to create slots" });
  }
};

// PUBLIC/USER: list available slots for an expert
// GET /api/availability/:expertId?from=...&to=...
exports.getExpertAvailability = async (req, res) => {
  try {
    const { expertId } = req.params;
    const from = req.query.from ? new Date(req.query.from) : new Date();
    const to = req.query.to ? new Date(req.query.to) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: "Invalid from/to dates" });
    }

    // cleanup expired holds first
    await releaseExpiredHolds(expertId);

    const meId = req.user?._id;

    // Show:
    // - available
    // - held by ME (so user sees their own held slot)
    const query = {
      expert: expertId,
      startAt: { $gte: from, $lte: to },
      $or: [
        { status: "available" },
        { status: "held", heldBy: meId, holdExpiresAt: { $gt: new Date() } },
      ],
    };

    const slots = await AvailabilitySlot.find(query)
      .sort({ startAt: 1 })
      .lean();

    return res.json(slots);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// EXPERT: list my slots
exports.getMySlots = async (req, res) => {
  try {
    const expertId = req.user._id;
    const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const to = req.query.to ? new Date(req.query.to) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await releaseExpiredHolds(expertId);

    const slots = await AvailabilitySlot.find({
      expert: expertId,
      startAt: { $gte: from, $lte: to },
    })
      .sort({ startAt: 1 });

    return res.json(slots);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
