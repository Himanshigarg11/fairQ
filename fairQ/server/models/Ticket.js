import mongoose from 'mongoose';

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
    type: String,
    enum: ['Normal', 'Emergency', 'Elderly', 'Disabled'],
    default: 'Normal'
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
