const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['destination', 'itinerary'],
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure either destination or itinerary is provided, but not both
favoriteSchema.pre('validate', function(next) {
  if (!this.destination && !this.itinerary) {
    return next(new Error('Favorite must be for either a destination or itinerary'));
  }
  if (this.destination && this.itinerary) {
    return next(new Error('Favorite cannot be for both destination and itinerary'));
  }
  next();
});

// Ensure user can only favorite the same item once
favoriteSchema.index({ user: 1, destination: 1 }, { unique: true, sparse: true });
favoriteSchema.index({ user: 1, itinerary: 1 }, { unique: true, sparse: true });

// Index for better search performance
favoriteSchema.index({ user: 1, type: 1 });
favoriteSchema.index({ createdAt: -1 });

// Check if user has already favorited this item
favoriteSchema.statics.isFavorited = async function(userId, destinationId = null, itineraryId = null) {
  const query = { user: userId };
  if (destinationId) query.destination = destinationId;
  if (itineraryId) query.itinerary = itineraryId;
  
  const favorite = await this.findOne(query);
  return !!favorite;
};

module.exports = mongoose.model('Favorite', favoriteSchema);
