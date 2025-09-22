const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  inviteeUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500,
    default: ''
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  declinedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
invitationSchema.index({ token: 1 });
invitationSchema.index({ inviteeEmail: 1 });
invitationSchema.index({ community: 1 });
invitationSchema.index({ status: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Check if invitation is expired
invitationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Check if invitation is valid (not expired and pending)
invitationSchema.methods.isValid = function() {
  return this.status === 'pending' && !this.isExpired();
};

// Accept invitation
invitationSchema.methods.accept = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
};

// Decline invitation
invitationSchema.methods.decline = function() {
  this.status = 'declined';
  this.declinedAt = new Date();
};

// Mark as expired
invitationSchema.methods.markAsExpired = function() {
  this.status = 'expired';
};

module.exports = mongoose.model('Invitation', invitationSchema);
