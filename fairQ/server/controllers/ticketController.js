import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { reorderTickets } from "../utils/reorderQueue.js";
export const requiredDocsList = {
  Hospital: ["Aadhar Card", "Doctor Prescription", "Medical Report"],
  Bank: ["Aadhar Card", "PAN Card", "Passbook Copy"],
  "Government Office": ["Aadhar Card", "Application Form", "Passport Photo"],
  "Post Office": ["ID Proof", "Application Slip"],
  "Telecom Office": ["Aadhar Card", "Old SIM", "Passport Photo"],
  "Airport": ["Ticket Copy", "ID Proof"],
  "Restaurant": ["Reservation ID (optional)"],
  DMV: ["Driving License Form", "2 Photos", "ID Proof"]
};

// Helper function to generate unique ticket number
const generateTicketNumber = async (organization) => {
  let isUnique = false;
  let ticketNumber = '';
  
  while (!isUnique) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const orgCode = organization.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
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
    console.log('📝 Book ticket request received:', req.body);
    
    const { organization, serviceType, purpose, priority, isEmergency } = req.body;
    const customerId = req.user._id;

    // Validation
    if (!organization || !serviceType || !purpose) {
      console.log('❌ Validation failed: missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Organization, service type, and purpose are required'
      });
    }

    console.log('✅ Validation passed');

    // Generate unique ticket number
    const ticketNumber = await generateTicketNumber(organization);
    console.log('🎫 Generated ticket number:', ticketNumber);

    // Get current queue position
    const pendingTickets = await Ticket.countDocuments({
      organization,
      status: { $in: ['Pending', 'Processing'] }
    });

    const queuePosition = pendingTickets + 1;
    const estimatedWaitTime = queuePosition * 15; // 15 minutes per person

    console.log('📊 Queue info:', { queuePosition, estimatedWaitTime });

    // Create ticket
    const ticket = await Ticket.create({
      ticketNumber, // Explicitly set ticket number
      customer: customerId,
      organization,
      serviceType,
      purpose,
      priority: {
      emergency: isEmergency === true,
      elderly: priority === "Elderly",
      prepared: false // becomes true only after PIT scan
      },
      isEmergency,
      queuePosition,
      estimatedWaitTime
    });

    console.log('✅ Ticket created successfully:', ticket._id);

    await ticket.populate('customer', 'firstName lastName email');

    // TODO: Send email notification
    console.log(`📧 Email notification: Ticket ${ticket.ticketNumber} booked for ${ticket.customer.email}`);

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully',
      data: { ticket }
    });
    
  } catch (error) {
    console.error('❌ Book ticket error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to book ticket'
    });
  }
};

// Get customer's tickets
export const getCustomerTickets = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { status } = req.query;

    console.log('📋 Fetching tickets for customer:', customerId);

    const filter = { customer: customerId };
    if (status) filter.status = status;

    const tickets = await Ticket.find(filter)
      .populate('customer', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${tickets.length} tickets for customer`);

    res.status(200).json({
      success: true,
      data: { tickets }
    });
  } catch (error) {
    console.error('❌ Get customer tickets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tickets'
    });
  }
};

// Get all tickets for staff
export const getAllTickets = async (req, res) => {
  try {
    const { status, organization } = req.query;
    
    console.log('📋 Fetching all tickets with filters:', { status, organization });
    
    const filter = {};
    if (status) filter.status = status;
    if (organization) filter.organization = organization;

    const tickets = await Ticket.find(filter)
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('processedBy', 'firstName lastName')
      .sort({ 
        priority: -1, // Emergency first
        createdAt: 1   // Then by booking time
      });

    console.log(`✅ Found ${tickets.length} tickets`);

    res.status(200).json({
      success: true,
      data: { tickets }
    });
  } catch (error) {
    console.error('❌ Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get tickets'
    });
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, notes } = req.body;
    const staffId = req.user._id;

    console.log('🔄 Updating ticket status:', { ticketId, status, notes });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      console.log('❌ Ticket not found:', ticketId);
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Update ticket
    const updateData = { status };
    if (notes) updateData.notes = notes;

    if (status === 'Processing') {
      updateData.processedAt = new Date();
      updateData.processedBy = staffId;
    } else if (status === 'Completed') {
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
    ).populate('customer', 'firstName lastName email')
     .populate('processedBy', 'firstName lastName');

    console.log('✅ Ticket updated successfully:', updatedTicket.ticketNumber);

    // TODO: Send status update email
    console.log(`📧 Status update email: Ticket ${updatedTicket.ticketNumber} is now ${status}`);

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: { ticket: updatedTicket }
    });
  } catch (error) {
    console.error('❌ Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update ticket status'
    });
  }
};

// Get ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    console.log('🔍 Fetching ticket by ID:', ticketId);

    const ticket = await Ticket.findById(ticketId)
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('processedBy', 'firstName lastName');

    if (!ticket) {
      console.log('❌ Ticket not found:', ticketId);
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user has permission to view this ticket
    if (req.user.role === 'Customer' && ticket.customer._id.toString() !== req.user._id.toString()) {
      console.log('❌ Access denied for customer:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('✅ Ticket found:', ticket.ticketNumber);

    res.status(200).json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    console.error('❌ Get ticket by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ticket'
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
      "pit.generated": false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets
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
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (ticket.customer.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not your ticket" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploadedDocs = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      uploadedAt: new Date()
    }));

    ticket.documents.push(...uploadedDocs);
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      data: ticket.documents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSortedQueue = async (req, res) => {
    const { serviceType } = req.params;

    const tickets = await Ticket.find({
        serviceType,
        status: { $in: ["Pending", "Processing"] }
    }).lean();

    const sorted = reorderTickets(tickets);

    res.json({ success: true, tickets: sorted });
};


// Get ticket statistics
export const getTicketStats = async (req, res) => {
  try {
    console.log('📊 Fetching ticket statistics');

    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTickets = await Ticket.countDocuments();
    const todayTickets = await Ticket.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    const organizationStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$organization',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('✅ Statistics calculated successfully');

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        totalTickets,
        todayTickets,
        organizationStats
      }
    });
  } catch (error) {
    console.error('❌ Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ticket statistics'
    });
  }
};
