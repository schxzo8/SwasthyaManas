const mongoose = require("mongoose");
const axios = require("axios");
const AvailabilitySlot = require("../models/AvailabilitySlot");
const Appointment = require("../models/Appointment");
const { notifyUser } = require("../utils/notify");
const Transaction = require("../models/Transaction");
const { generateHmacSha256Hash } = require("../utils/helper");
const User = require("../models/User");

// eSewa: initiate payment
exports.initiateEsewaPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const now = new Date();
    await AvailabilitySlot.updateOne(
      { _id: slotId, status: "held", holdExpiresAt: { $lte: now } },
      { $set: { status: "open", heldBy: null, holdExpiresAt: null } }
    );

    const slot = await AvailabilitySlot.findOne({
      _id: slotId, status: "held", heldBy: userId, holdExpiresAt: { $gt: now },
    }).populate("expert", "firstName lastName");

    if (!slot) return res.status(409).json({ message: "Hold expired or slot not held by you" });
    if (!slot.fee || slot.fee === 0) return res.json({ free: true, slotId: String(slot._id) });

    const productId = `slot_${slotId}_user_${userId}_${Date.now()}`;
    const amount    = slot.fee;

    const paymentData = {
      amount:                   String(amount),
      failure_url:              process.env.FAILURE_URL,
      product_delivery_charge:  "0",
      product_service_charge:   "0",
      product_code:             process.env.ESEWA_MERCHANT_ID,
      signed_field_names:       "total_amount,transaction_uuid,product_code",
      success_url:              process.env.SUCCESS_URL,
      tax_amount:               "0",
      total_amount:             String(amount),
      transaction_uuid:         productId,
    };

    const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = generateHmacSha256Hash(data, process.env.ESEWA_SECRET);

    // save transaction record
    await Transaction.create({
      customerDetails: {
        name:  `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: "",
      },
      product_name:     `Appointment with ${slot.expert?.firstName} ${slot.expert?.lastName}`,
      product_id:       productId,
      amount,
      payment_gateway:  "esewa",
      slotId:           slot._id,
    });

    return res.json({
      gateway: "esewa",
      url:     process.env.ESEWA_PAYMENT_URL,
      data:    { ...paymentData, signature },
    });
  } catch (err) {
    // eSewa initiate error handled
    return res.status(500).json({ message: "Failed to initiate eSewa payment" });
  }
};

// Shared: payment status check + appointment creation 
exports.paymentStatus = async (req, res) => {
  try {
    const { product_id, pidx, status, gateway } = req.body;
    const userId = req.user._id;

    const transaction = await Transaction.findOne({ product_id });
    if (!transaction) return res.status(400).json({ message: "Transaction not found" });

    if (status === "FAILED") {
      await Transaction.updateOne({ product_id }, { $set: { status: "FAILED" } });
      return res.json({ message: "Marked as failed", status: "FAILED" });
    }

    let completed = false;

    if (transaction.payment_gateway === "esewa") {
      const response = await axios.get(process.env.ESEWA_PAYMENT_STATUS_CHECK_URL, {
        params: {
          product_code:     process.env.ESEWA_MERCHANT_ID,
          total_amount:     transaction.amount,
          transaction_uuid: transaction.product_id,
        },
      });
      completed = response.data?.status === "COMPLETE";

    } else if (transaction.payment_gateway === "khalti") {
      const response = await axios.post(
        `${process.env.KHALTI_GATEWAY_URL}/epay/lookup/`,
        { pidx },
        { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
      );
      completed = response.data?.status === "Completed";
    }

    if (!completed) {
      await Transaction.updateOne({ product_id }, { $set: { status: "FAILED" } });
      return res.json({ message: "Payment not completed", status: "FAILED" });
    }

    await Transaction.updateOne({ product_id }, { $set: { status: "COMPLETED" } });

    // extract slotId from product_id: "slot_<slotId>_user_<userId>_<ts>"
    const slotId = transaction.slotId || product_id.split("_")[1];

    const appointment = await _createAppointment(req, userId, slotId, {
      status:   "paid",
      amount:   transaction.amount,
      currency: "NPR",
      provider: transaction.payment_gateway,
      khaltiPidx: pidx || "",
    });

    await Transaction.updateOne({ product_id }, { $set: { appointmentId: appointment._id } });

    return res.json({ message: "Payment verified & booking confirmed", status: "COMPLETED", appointment });
  } catch (err) {
    // Payment status check error handled
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// Khalti: initiate payment
// POST /api/appointments/khalti/initiate { slotId }
exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const now = new Date();
    await AvailabilitySlot.updateOne(
      { _id: slotId, status: "held", holdExpiresAt: { $lte: now } },
      { $set: { status: "open", heldBy: null, holdExpiresAt: null } }
    );

    const slot = await AvailabilitySlot.findOne({
      _id: slotId, status: "held", heldBy: userId, holdExpiresAt: { $gt: now },
    }).populate("expert", "firstName lastName");

    if (!slot) return res.status(409).json({ message: "Hold expired or slot not held by you" });
    if (!slot.fee || slot.fee === 0) return res.json({ free: true, slotId: String(slot._id) });

    const productId = `slot_${slotId}_user_${userId}_${Date.now()}`;

    // save transaction record
    await Transaction.create({
      customerDetails: {
        name:  `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: "",
      },
      product_name:    `Appointment with ${slot.expert?.firstName} ${slot.expert?.lastName}`,
      product_id:      productId,
      amount:          slot.fee,
      payment_gateway: "khalti",
      slotId:          slot._id,
    });

    // Mock payment URL (swap for real Khalti when merchant account ready)
    const mockPidx       = `mock_pidx_${Date.now()}`;
    const mockPaymentUrl = `${process.env.CLIENT_URL}/mock-khalti-payment?` +
      `pidx=${mockPidx}&amount=${slot.fee * 100}&purchase_order_id=${productId}`;

    return res.json({ free: false, payment_url: mockPaymentUrl, pidx: mockPidx });
  } catch (err) {
    // Khalti initiate error handled
    return res.status(500).json({ message: "Failed to initiate payment" });
  }
};

// Khalti: verify payment + create appointment
// POST /api/appointments/khalti/verify { pidx, slotId }
exports.verifyKhaltiPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { pidx, slotId } = req.body;
    if (!pidx || !slotId) return res.status(400).json({ message: "pidx and slotId required" });

    // verify with Khalti
    const verification = await axios.post(
      `${process.env.KHALTI_GATEWAY_URL}/epay/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { status, total_amount } = verification.data;

    if (status !== "Completed") {
      return res.status(400).json({ message: `Payment not completed. Status: ${status}` });
    }

    // now create the appointment
    const appointment = await _createAppointment(req, userId, slotId, {
      status: "paid",
      amount: total_amount / 100,
      currency: "NPR",
      khaltiPidx: pidx,
    });

    return res.status(201).json({ message: "Payment verified & booking confirmed", appointment });
  } catch (err) {
    // Khalti verify error handled
    return res.status(500).json({ message: err.message || "Verification failed" });
  }
};

// Confirm booking (free slots) 
// POST /api/appointments/confirm { slotId, userNotes? }
exports.confirmBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId, userNotes } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const appointment = await _createAppointment(req, userId, slotId, {
      status: "unpaid",
      amount: 0,
      currency: "NPR",
    }, userNotes);

    return res.status(201).json({ message: "Booking confirmed", appointment });
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ message: err.message || "Server error" });
  }
};

// Shared appointment creation logic 
async function _createAppointment(req, userId, slotId, paymentData, userNotes = "") {
  const now = new Date();

  await AvailabilitySlot.updateOne(
    { _id: slotId, status: "held", holdExpiresAt: { $lte: now } },
    { $set: { status: "open", heldBy: null, holdExpiresAt: null } }
  );

  const slot = await AvailabilitySlot.findOne({
    _id: slotId,
    status: "held",
    heldBy: userId,
    holdExpiresAt: { $gt: now },
  });

  if (!slot) {
    const e = new Error("Hold expired or slot not held by you");
    e.statusCode = 409;
    throw e;
  }

  const appointment = await Appointment.create({
    user: userId,
    expert: slot.expert,
    slot: slot._id,
    startAt: slot.startAt,
    endAt: slot.endAt,
    durationMins: slot.durationMins || 50,
    userNotes,
    payment: {
      status:    paymentData.status,
      amount:    paymentData.amount ?? slot.fee ?? 0,
      currency:  paymentData.currency || slot.currency || "NPR",
      provider:  paymentData.provider || "",
      reference: paymentData.khaltiPidx || "",
    },
  });

  await AvailabilitySlot.updateOne(
    { _id: slot._id },
    {
      $set:   { status: "booked", bookedBy: userId, appointment: appointment._id },
      $unset: { heldBy: "", holdExpiresAt: "" },
    }
  );

  // notify expert
  await notifyUser(req, appointment.expert, {
    type: "appointment_new",
    title: "New appointment booked",
    message: `${userName} has booked an appointment with you.`,
    link: "/appointments",
    meta: { appointmentId: String(appointment._id) },
  });

  // notify user
  const expertDoc = await require("../models/User").findById(appointment.expert).select("firstName lastName");
  const expertName = expertDoc ? `${expertDoc.firstName} ${expertDoc.lastName}`.trim() : "your expert";

  await notifyUser(req, userId, {
    type: "appointment_new",
    title: "Booking confirmed",
    message: `Your appointment with ${expertName} has been confirmed.`,
    link: "/appointments",
    meta: { appointmentId: String(appointment._id) },
  });

  const io = req.app.get("io");
  if (io) {
    const evt = {
      appointmentId: String(appointment._id),
      slotId:   String(appointment.slot),
      userId:   String(appointment.user),
      expertId: String(appointment.expert),
      startAt:  appointment.startAt,
      endAt:    appointment.endAt,
    };
    io.to(`user_${evt.userId}`).emit("appointment:new", evt);
    io.to(`user_${evt.expertId}`).emit("appointment:new", evt);
    io.to(`user_${evt.userId}`).emit("slot:update", { slotId: evt.slotId, status: "booked" });
    io.to(`user_${evt.expertId}`).emit("slot:update", { slotId: evt.slotId, status: "booked" });
  }

  return appointment;
}

function buildViewFilter(view, now) {
  if (view === "upcoming") return { endAt: { $gte: now } };
  if (view === "past") return { endAt: { $lt: now } };
  return {};
}

// USER: my appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const view = String(req.query.view || "upcoming");
    const now = new Date();
    const sort = view === "upcoming" ? { startAt: 1 } : { startAt: -1 };

    const list = await Appointment.find({ user: userId, ...buildViewFilter(view, now) })
      .populate("expert", "firstName lastName email expertise")
      .populate("slot", "startAt endAt durationMins fee currency")
      .sort(sort);

    return res.json({ appointments: list });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

// EXPERT: my appointments
exports.getExpertAppointments = async (req, res) => {
  try {
    const expertId = req.user._id;
    const view = String(req.query.view || "upcoming");
    const now = new Date();
    const sort = view === "upcoming" ? { startAt: 1 } : { startAt: -1 };

    const list = await Appointment.find({ expert: expertId, ...buildViewFilter(view, now) })
      .populate("user", "firstName lastName email")
      .populate("slot", "startAt endAt durationMins fee currency")
      .sort(sort);

    return res.json({ appointments: list });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

// Mock payment verify (sandbox only)
exports.mockVerifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ message: "slotId is required" });

    const appointment = await _createAppointment(req, userId, slotId, {
      status: "paid",
      amount: 0, // will use slot.fee inside _createAppointment
      currency: "NPR",
      khaltiPidx: "mock_" + Date.now(),
    });

    return res.status(201).json({ message: "Mock payment verified", appointment });
  } catch (err) {
    const code = err.statusCode || 500;
    return res.status(code).json({ message: err.message || "Server error" });
  }
};

// EXPERT: mark appointment as completed
exports.markAppointmentCompleted = async (req, res) => {
  try {
    const expertId = req.user._id;
    const { id }   = req.params;

    const appointment = await Appointment.findOne({ _id: id, expert: expertId });
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.status !== "confirmed")
      return res.status(400).json({ message: `Cannot complete an appointment with status: ${appointment.status}` });

    appointment.status = "completed";
    await appointment.save();

    // notify user
    await notifyUser(req, appointment.user, {
      type:    "appointment_update",
      title:   "Appointment completed",
      message: "Your appointment has been marked as completed.",
      link:    "/appointments",
      meta:    { appointmentId: String(appointment._id) },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user_${String(appointment.user)}`).emit("appointment:update", {
        appointmentId: String(appointment._id),
        status: "completed",
      });
    }

    res.json({ message: "Appointment marked as completed", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};