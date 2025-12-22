import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { sendPushNotification } from "../services/notificationService.js";
import { reorderTickets } from "../utils/reorderQueue.js";
import {
  sendTicketBookedEmail,
  sendProcessingStartedEmail,
  sendCompletedEmail,
  sendTurnAlertEmail,
  sendArrivalWindowEmail,
} from "../services/emailService.js";

export const requiredDocsList = {
  Hospital: ["Aadhar Card", "Doctor Prescription", "Medical Report"],
  Bank: ["Aadhar Card", "PAN Card", "Passbook Copy"],
  "Government Office": ["Aadhar Card", "Application Form", "Passport Photo"],
  "Post Office": ["ID Proof", "Application Slip"],
  "Telecom Office": ["Aadhar Card", "Old SIM", "Passport Photo"],
  Airport: ["Ticket Copy", "ID Proof"],
  Restaurant: ["Reservation ID (optional)"],
  DMV: ["Driving License Form", "2 Photos", "ID Proof"],
};

// Helper function to generate unique ticket number
const generateTicketNumber = async (organization) => {
  let isUnique = false;
  let ticketNumber = "";

  while (!isUnique) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const orgCode = organization.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    ticketNumber = `${orgCode}-${dateStr}-${randomNum}`;

    // Check if this ticket number already exists
    const existingTicket = await Ticket.findOne({ ticketNumber });
    if (!existingTicket) {
      isUnique = true;
    }
  }

  return ticketNumber;
};

// Book a new ticket
export const bookTicket = async (req, res) => {
  try {
    console.log("📝 Book ticket request received:", req.body);

    const {
      organization,
      hospitalName,
      serviceType,
      purpose,
      priority,
      isEmergency,
    } = req.body;
    const customerId = req.user._id;

    // Validation
    if (!organization || !serviceType || !purpose) {
      console.log("❌ Validation failed: missing required fields");
      return res.status(400).json({
        success: false,
        message: "Organization, service type, and purpose are required",
      });
    }

    if (organization === "Hospital" && !hospitalName) {
      return res.status(400).json({
        success: false,
        message: "Hospital selection is required",
      });
    }

    console.log("✅ Validation passed");

    // Generate unique ticket number
    const ticketNumber = await generateTicketNumber(organization);
    console.log("🎫 Generated ticket number:", ticketNumber);

    // Get current queue position
    const pendingTickets = await Ticket.countDocuments({
      organization,
      hospitalName,
      status: { $in: ["Pending", "Processing"] },
    });

    const queuePosition = pendingTickets + 1;
    const estimatedWaitTime = queuePosition * 15; // 15 minutes per person
    const now = new Date();

    const arrivalStart = new Date(
      now.getTime() + (estimatedWaitTime - 10) * 60000
    );

    const arrivalEnd = new Date(arrivalStart.getTime() + 15 * 60000);

    console.log("📊 Queue info:", { queuePosition, estimatedWaitTime });

    // Create ticket
    const ticket = await Ticket.create({
      ticketNumber, // Explicitly set ticket number
      customer: customerId,
      organization,
      hospitalName,
      serviceType,
      purpose,
      priority: {
        emergency: isEmergency === true,
        elderly: priority === "Elderly",
        prepared: false, // becomes true only after PIT scan
      },
      arrivalWindow: {
        start: arrivalStart,
        end: arrivalEnd,
      },
      isEmergency,
      queuePosition,
      estimatedWaitTime,
    });

    console.log("✅ Ticket created successfully:", ticket._id);

    await ticket.populate(
      "customer",
      "firstName lastName email fcmToken notificationPreferences"
    );

    if (
      ticket.customer?.fcmToken &&
      ticket.customer.notificationPreferences?.pushEnabled
    ) {
      await sendPushNotification({
        token: ticket.customer.fcmToken,
        title: "🎟 Ticket Booked",
        body: `Your ticket ${ticket.ticketNumber} has been booked successfully.`,
        data: {
          ticketId: ticket._id.toString(),
          status: "Pending",
        },
      });
    }

    // TODO: Send email notification
    if (
      ticket.customer?.email &&
      ticket.customer.notificationPreferences?.emailEnabled
    ) {
      sendTicketBookedEmail(ticket, ticket.customer)
        .then(() => {
          console.log(
            `📧 Ticket booked email sent to ${ticket.customer.email}`
          );
        })
        .catch((err) => {
          console.error("❌ Failed to send ticket booked email:", err.message);
        });
    }
    const io = req.app.get("io");
    io.emit("newTicketBooked", ticket);
    res.status(201).json({
      success: true,
      message: "Ticket booked successfully",
      data: { ticket },
    });
  } catch (error) {
    console.error("❌ Book ticket error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to book ticket",
    });
  }
};

// Get customer's tickets
export const getCustomerTickets = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { status } = req.query;

    console.log("📋 Fetching tickets for customer:", customerId);

    const filter = { customer: customerId };
    if (status) filter.status = status;

    const tickets = await Ticket.find(filter)
      .populate("customer", "firstName lastName email")
      .populate("processedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${tickets.length} tickets for customer`);

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (error) {
    console.error("❌ Get customer tickets error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get tickets",
    });
  }
};

// Get all tickets for staff
export const getAllTickets = async (req, res) => {
  try {
    const { status, organization } = req.query;

    console.log("📋 Fetching all tickets with filters:", {
      status,
      organization,
    });

    const filter = {};

    if (req.user.role === "Staff") {
      filter.organization = "Hospital";
      filter.hospitalName = req.user.assignedHospital;
    } else {
      if (organization) filter.organization = organization;
    }

    if (status) filter.status = status;

    const tickets = await Ticket.find(filter)
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("processedBy", "firstName lastName")
      .sort({
        priority: -1, // Emergency first
        createdAt: 1, // Then by booking time
      });

    console.log(`✅ Found ${tickets.length} tickets`);

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (error) {
    console.error("❌ Get all tickets error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get tickets",
    });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, notes } = req.body;
    const staffId = req.user._id;

    const ALLOWED_STATUSES = ["Pending", "Processing", "Completed"];
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (
      req.user.role === "Staff" &&
      ticket.hospitalName !== req.user.assignedHospital
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const updateData = {
      status,
      ...(notes && { notes }),
    };

    if (status === "Processing") {
      updateData.processedAt = new Date();
      updateData.processedBy = staffId;
    }

    if (status === "Completed") {
      updateData.completedAt = new Date();
      if (!ticket.processedBy) {
        updateData.processedBy = staffId;
        updateData.processedAt = new Date();
      }
    }

  const updatedTicket = await Ticket.findByIdAndUpdate(
  ticketId,
  updateData,
  { new: true }
)
  .populate(
    "customer",
    "firstName lastName email fcmToken notificationPreferences"
  )
  .populate("processedBy", "firstName lastName");

/* =======================
   📧 EMAIL NOTIFICATIONS
======================= */

// ✅ PROCESSING EMAIL
if (
  status === "Processing" &&
  updatedTicket.customer?.email &&
  updatedTicket.customer.notificationPreferences?.emailEnabled
) {
  try {
    await sendProcessingStartedEmail(
      updatedTicket,
      updatedTicket.customer
    );
    console.log("📧 Processing email sent");
  } catch (err) {
    console.error("❌ Processing email failed:", err.message);
  }
}

// ✅ COMPLETED EMAIL
if (
  status === "Completed" &&
  updatedTicket.customer?.email &&
  updatedTicket.customer.notificationPreferences?.emailEnabled
) {
  try {
    await sendCompletedEmail(
      updatedTicket,
      updatedTicket.customer
    );
    console.log("📧 Completed email sent");
  } catch (err) {
    console.error("❌ Completed email failed:", err.message);
  }
}

    /* =======================
       🕒 ARRIVAL WINDOW UPDATE
    ======================= */
    if (status === "Completed") {
      const pendingTickets = await Ticket.find({
        organization: updatedTicket.organization,
        hospitalName: updatedTicket.hospitalName,
        status: "Pending",
      }).sort({ queuePosition: 1 });

      const now = new Date();

      for (const t of pendingTickets) {
        const arrivalStart = new Date(
          now.getTime() + (t.estimatedWaitTime - 10) * 60000
        );
        const arrivalEnd = new Date(arrivalStart.getTime() + 15 * 60000);

        await Ticket.updateOne(
          { _id: t._id },
          { arrivalWindow: { start: arrivalStart, end: arrivalEnd } }
        );
      }
    }

    /* =======================
       🔌 SOCKET.IO EVENTS
    ======================= */
    const io = req.app.get("io");

    // Notify customer
    if (updatedTicket.customer?._id) {
      io.to(updatedTicket.customer._id.toString()).emit(
        "ticketUpdated",
        updatedTicket
      );
    }

    // Notify staff dashboards
    io.emit("staffTicketUpdated", {
      ticketId: updatedTicket._id,
      status: updatedTicket.status,
    });

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: { ticket: updatedTicket },
    });
  } catch (error) {
    console.error("❌ Update ticket status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update ticket status",
    });
  }
};

// Get ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    console.log("🔍 Fetching ticket by ID:", ticketId);

    const ticket = await Ticket.findById(ticketId)
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("processedBy", "firstName lastName");

    if (!ticket) {
      console.log("❌ Ticket not found:", ticketId);
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check if user has permission to view this ticket
    if (
      req.user.role === "Customer" &&
      ticket.customer._id.toString() !== req.user._id.toString()
    ) {
      console.log("❌ Access denied for customer:", req.user._id);
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    console.log("✅ Ticket found:", ticket.ticketNumber);

    res.status(200).json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    console.error("❌ Get ticket by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get ticket",
    });
  }
};
// Get pending tickets for PIT
export const getPendingTicketsForPIT = async (req, res) => {
  try {
    const customerId = req.user._id;

    const tickets = await Ticket.find({
      customer: customerId,
      status: "Pending",
      "pit.generated": false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//upload documents

export const uploadDocuments = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const userId = req.user._id;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    if (ticket.customer.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not your ticket" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const uploadedDocs = req.files.map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
    }));

    ticket.documents.push(...uploadedDocs);
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      data: ticket.documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSortedQueue = async (req, res) => {
  const { serviceType } = req.params;

  const tickets = await Ticket.find({
    serviceType,
    status: { $in: ["Pending", "Processing"] },
  }).lean();

  const sorted = reorderTickets(tickets);

  res.json({ success: true, tickets: sorted });
};

// Get ticket statistics
export const getTicketStats = async (req, res) => {
  try {
    console.log("📊 Fetching ticket statistics");

    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTickets = await Ticket.countDocuments();
    const todayTickets = await Ticket.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });

    const organizationStats = await Ticket.aggregate([
      {
        $group: {
          _id: "$organization",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("✅ Statistics calculated successfully");

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        totalTickets,
        todayTickets,
        organizationStats,
      },
    });
  } catch (error) {
    console.error("❌ Get ticket stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get ticket statistics",
    });
  }
};
