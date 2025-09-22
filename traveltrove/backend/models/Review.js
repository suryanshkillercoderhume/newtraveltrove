const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  },
  itinerary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  pros: [{
    type: String,
    maxlength: 200
  }],
  cons: [{
    type: String,
    maxlength: 200
  }],
  visitDate: Date,
  travelStyle: {
    type: String,
    enum: ['Adventure', 'Relaxation', 'Cultural', 'Food', 'Nature', 'City', 'Beach', 'Mixed']
  },
  groupSize: {
    type: String,
    enum: ['Solo', 'Couple', 'Small Group (2-4)', 'Medium Group (5-8)', 'Large Group (9+)']
  },
  images: [{
    url: String,
    caption: String
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure either destination or itinerary is provided, but not both
reviewSchema.pre('validate', function(next) {
  if (!this.destination && !this.itinerary) {
    return next(new Error('Review must be for either a destination or itinerary'));
  }
  if (this.destination && this.itinerary) {
    return next(new Error('Review cannot be for both destination and itinerary'));
  }
  next();
});

// Index for better search performance
reviewSchema.index({ destination: 1 });
reviewSchema.index({ itinerary: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ 'helpful.user': 1 });

// Update timestamp on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update destination/itinerary rating after review is saved
reviewSchema.post('save', async function() {
  if (this.destination) {
    const Destination = mongoose.model('Destination');
    const destination = await Destination.findById(this.destination);
    if (destination) {
      await destination.updateRating();
    }
  }
  if (this.itinerary) {
    const Itinerary = mongoose.model('Itinerary');
    const itinerary = await Itinerary.findById(this.itinerary);
    if (itinerary) {
      await itinerary.updateRating();
    }
  }
});

// Update destination/itinerary rating after review is deleted
reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  if (this.destination) {
    const Destination = mongoose.model('Destination');
    const destination = await Destination.findById(this.destination);
    if (destination) {
      await destination.updateRating();
    }
  }
  if (this.itinerary) {
    const Itinerary = mongoose.model('Itinerary');
    const itinerary = await Itinerary.findById(this.itinerary);
    if (itinerary) {
      await itinerary.updateRating();
    }
  }
});

// Check if user has already reviewed this destination/itinerary
reviewSchema.statics.hasUserReviewed = async function(userId, destinationId = null, itineraryId = null) {
  const query = { user: userId };
  if (destinationId) query.destination = destinationId;
  if (itineraryId) query.itinerary = itineraryId;
  
  const existingReview = await this.findOne(query);
  return !!existingReview;
};

module.exports = mongoose.model('Review', reviewSchema);
