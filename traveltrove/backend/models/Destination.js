const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  summary: {
    type: String,
    required: true,
    maxlength: 300
  },
  location: {
    country: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Nature', 'Historical', 'Food', 'Nightlife', 'Family', 'Romantic', 'Budget', 'Luxury']
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  history: {
    type: String,
    maxlength: 2000
  },
  culture: {
    type: String,
    maxlength: 2000
  },
  attractions: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['Landmark', 'Museum', 'Park', 'Beach', 'Mountain', 'Temple', 'Market', 'Restaurant', 'Other']
    },
    location: String,
    image: String
  }],
  lodging: [{
    name: String,
    type: {
      type: String,
      enum: ['Hotel', 'Hostel', 'Resort', 'Apartment', 'Villa', 'Camping', 'Other']
    },
    priceRange: {
      type: String,
      enum: ['Budget', 'Mid-range', 'Luxury']
    },
    description: String,
    location: String,
    rating: Number,
    image: String
  }],
  dining: [{
    name: String,
    cuisine: String,
    priceRange: {
      type: String,
      enum: ['Budget', 'Mid-range', 'Fine Dining']
    },
    description: String,
    location: String,
    rating: Number,
    image: String
  }],
  activities: [{
    name: String,
    type: {
      type: String,
      enum: ['Adventure', 'Cultural', 'Relaxation', 'Nightlife', 'Shopping', 'Nature', 'Sports', 'Other']
    },
    description: String,
    duration: String,
    priceRange: {
      type: String,
      enum: ['Free', 'Budget', 'Mid-range', 'Expensive']
    },
    location: String,
    image: String
  }],
  bestTimeToVisit: {
    type: String,
    maxlength: 500
  },
  travelTips: [{
    type: String,
    maxlength: 200
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Index for better search performance
destinationSchema.index({ name: 'text', description: 'text', summary: 'text', tags: 'text' });
destinationSchema.index({ category: 1 });
destinationSchema.index({ 'location.country': 1, 'location.city': 1 });
destinationSchema.index({ averageRating: -1 });
destinationSchema.index({ createdAt: -1 });

// Update timestamp on save
destinationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update average rating when reviews change
destinationSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ destination: this._id });
  
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / reviews.length;
    this.reviewCount = reviews.length;
  } else {
    this.averageRating = 0;
    this.reviewCount = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('Destination', destinationSchema);
