import mongoose from 'mongoose';
export const REQUIRED_DOCS_BY_ORG = {
  Hospital: [
    "Aadhar Card",
    "Appointment Confirmation PDF",
    "Medical Reference Letter"
  ],
  Bank: [
    "Aadhar Card",
    "Account Statement",
    "Service Request Form"
  ],
  "Government Office": [
    "Aadhar Card",
    "Appointment Slip",
    "Application Form",
    "Supporting Documents"
  ],
  Airport: [
    "Aadhar Card",
    "Flight Booking Confirmation",
    "Service Request Form"
  ],
  Restaurant: [
    "Aadhar Card"
  ],
  DMV: [
    "Aadhar Card",
    "Driving License Application",
    "Appointment Confirmation"
  ],
  "Post Office": [
    "Aadhar Card",
    "Mail/Parcel Documents"
  ],
  "Telecom Office": [
    "Aadhar Card",
    "SIM Request Form"
  ]
};

const ticketSchema = new mongoose.Schema({
  
  ticketNumber: {
    type: String,
    unique: true,
    // Remove required: true since we generate it automatically
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: true,
    enum: ['Hospital', 'Bank', 'Government Office', 'Restaurant', 'Airport', 'DMV', 'Post Office', 'Telecom Office']
  },
  arrivalWindow: {
    start: { type: Date },
    end: { type: Date },
  },
  arrivalAlertSent: {
    type: Boolean,
    default: false,
  },

  hospitalName: {
  type: String,
  required: function () {
    return this.organization === "Hospital";
  },
},

  serviceType: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    maxlength: 500
  },
  priority: {
  emergency: { type: Boolean, default: false },
  elderly: { type: Boolean, default: false },
  prepared: { type: Boolean, default: false }
},
  isEmergency: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  queuePosition: {
    type: Number,
    default: null
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    default: null
  },
  // 🔔 Turn alert email flag (prevents duplicate emails)
turnAlertSent: {
  type: Boolean,
  default: false
},
// 🔔 Push notification flags (prevents duplicate Firebase pushes)
pushNotifications: {
  bookedSent: {
    type: Boolean,
    default: false
  },
  processingSent: {
    type: Boolean,
    default: false
  },
  completedSent: {
    type: Boolean,
    default: false
  }
},


  bookedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
 notes: {
    type: String,
    default: ''
  },

  requiredDocuments: {
  type: [String],
  default: []
},

documents: [
  {
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }
],


  // ⭐ PIT fields
  pit: {
    generated: { type: Boolean, default: false },
    generatedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null }
  },

  // ⭐ Prepared flag for after PIT validation
  isPrepared: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});
// Auto-fill requiredDocuments based on organization if not set.
// Place this BEFORE the ticketSchema.pre('save', ...) block.
ticketSchema.pre("validate", function (next) {
  try {
    // Only set if array is empty / not provided (so we don't overwrite manual values)
    if ((!this.requiredDocuments || this.requiredDocuments.length === 0) && this.organization) {
      const org = this.organization;
      if (REQUIRED_DOCS_BY_ORG[org]) {
        this.requiredDocuments = REQUIRED_DOCS_BY_ORG[org].slice(); // copy array
      } else {
        this.requiredDocuments = []; // fallback
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Generate unique ticket number before saving
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    let isUnique = false;
    let ticketNumber = '';
    
    while (!isUnique) {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const orgCode = this.organization.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      ticketNumber = `${orgCode}-${dateStr}-${randomNum}`;
      
      // Check if this ticket number already exists
      const existingTicket = await mongoose.model('Ticket').findOne({ ticketNumber });
      if (!existingTicket) {
        isUnique = true;
      }
    }
    
    this.ticketNumber = ticketNumber;
  }
  next();
});

export default mongoose.model('Ticket', ticketSchema);
