const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  title: {
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
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  duration: {
    days: {
      type: Number,
      required: true,
      min: 1,
      max: 365
    },
    startDate: Date,
    endDate: Date
  },
  budget: {
    type: {
      type: String,
      enum: ['Budget', 'Mid-range', 'Luxury'],
      required: true
    },
    estimatedCost: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  travelStyle: {
    type: String,
    enum: ['Adventure', 'Relaxation', 'Cultural', 'Food', 'Nature', 'City', 'Beach', 'Mixed'],
    required: true
  },
  groupSize: {
    type: String,
    enum: ['Solo', 'Couple', 'Small Group (2-4)', 'Medium Group (5-8)', 'Large Group (9+)'],
    default: 'Solo'
  },
  days: [{
    dayNumber: {
      type: Number,
      required: true
    },
    date: Date,
    activities: [{
      time: String,
      activity: {
        name: String,
        description: String,
        type: {
          type: String,
          enum: ['Sightseeing', 'Dining', 'Accommodation', 'Transportation', 'Activity', 'Free Time', 'Cultural', 'Relaxation', 'Adventure', 'Nature', 'Nightlife', 'Shopping', 'Sports', 'Other']
        },
        location: String,
        duration: String,
        cost: Number,
        notes: String
      }
    }],
    notes: String
  }],
  accommodations: [{
    name: String,
    type: {
      type: String,
      enum: ['Hotel', 'Hostel', 'Resort', 'Apartment', 'Villa', 'Camping', 'Other']
    },
    checkIn: Date,
    checkOut: Date,
    location: String,
    cost: Number,
    notes: String
  }],
  transportation: [{
    type: {
      type: String,
      enum: ['Flight', 'Train', 'Bus', 'Car', 'Taxi', 'Walking', 'Boat', 'Other']
    },
    from: String,
    to: String,
    departureTime: Date,
    arrivalTime: Date,
    cost: Number,
    notes: String
  }],
  packingList: [{
    category: {
      type: String,
      enum: ['Clothing', 'Electronics', 'Toiletries', 'Documents', 'Accessories', 'Other']
    },
    items: [String]
  }],
  tips: [{
    type: String,
    maxlength: 200
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
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
itinerarySchema.index({ title: 'text', description: 'text' });
itinerarySchema.index({ destination: 1 });
itinerarySchema.index({ 'budget.type': 1 });
itinerarySchema.index({ travelStyle: 1 });
itinerarySchema.index({ isPublic: 1 });
itinerarySchema.index({ averageRating: -1 });
itinerarySchema.index({ createdAt: -1 });

// Update timestamp on save
itinerarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update average rating when reviews change
itinerarySchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ itinerary: this._id });
  
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

module.exports = mongoose.model('Itinerary', itinerarySchema);
