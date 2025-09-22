const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Destination = require('../models/Destination');
const Itinerary = require('../models/Itinerary');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews with filters
// @access  Public
router.get('/', [
  query('destination').optional().isMongoId(),
  query('itinerary').optional().isMongoId(),
  query('rating').optional().isInt({ min: 1, max: 5 }),
  query('travelStyle').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['rating', 'createdAt', 'helpful']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      destination,
      itinerary,
      rating,
      travelStyle,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { isActive: true };
    if (destination) query.destination = destination;
    if (itinerary) query.itinerary = itinerary;
    if (rating) query.rating = parseInt(rating);
    if (travelStyle) query.travelStyle = travelStyle;

    // Build sort
    let sort = {};
    if (sortBy === 'helpful') {
      sort = { 'helpful': -1, createdAt: -1 };
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username firstName lastName profilePicture')
      .populate('destination', 'name location')
      .populate('itinerary', 'title destination')
      .populate('itinerary.destination', 'name location');

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username firstName lastName profilePicture')
      .populate('destination', 'name location')
      .populate('itinerary', 'title destination')
      .populate('itinerary.destination', 'name location');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private
router.post('/', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('destination').optional().isMongoId(),
  body('itinerary').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { destination, itinerary } = req.body;

    // Check if user has already reviewed this item
    const hasReviewed = await Review.hasUserReviewed(req.user._id, destination, itinerary);
    if (hasReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Verify destination or itinerary exists
    if (destination) {
      const dest = await Destination.findById(destination);
      if (!dest) {
        return res.status(400).json({
          success: false,
          message: 'Destination not found'
        });
      }
    }

    if (itinerary) {
      const itin = await Itinerary.findById(itinerary);
      if (!itin) {
        return res.status(400).json({
          success: false,
          message: 'Itinerary not found'
        });
      }
    }

    const reviewData = {
      ...req.body,
      user: req.user._id
    };

    const review = new Review(reviewData);
    await review.save();

    await review.populate('user', 'username firstName lastName profilePicture');
    if (destination) {
      await review.populate('destination', 'name location');
    }
    if (itinerary) {
      await review.populate('itinerary', 'title destination');
      await review.populate('itinerary.destination', 'name location');
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the author
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('user', 'username firstName lastName profilePicture')
      .populate('destination', 'name location')
      .populate('itinerary', 'title destination')
      .populate('itinerary.destination', 'name location');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the author
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review'
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user has already marked this review as helpful
    const alreadyHelpful = review.helpful.some(
      helpful => helpful.user.toString() === req.user._id.toString()
    );

    if (alreadyHelpful) {
      // Remove helpful vote
      review.helpful = review.helpful.filter(
        helpful => helpful.user.toString() !== req.user._id.toString()
      );
    } else {
      // Add helpful vote
      review.helpful.push({ user: req.user._id });
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyHelpful ? 'Removed helpful vote' : 'Marked as helpful',
      data: { helpfulCount: review.helpful.length }
    });
  } catch (error) {
    console.error('Toggle helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating helpful vote'
    });
  }
});

// @route   GET /api/reviews/stats/:type/:id
// @desc    Get review statistics for destination or itinerary
// @access  Public
router.get('/stats/:type/:id', [
  query('type').isIn(['destination', 'itinerary'])
], async (req, res) => {
  try {
    const { type, id } = req.params;
    const queryField = type === 'destination' ? 'destination' : 'itinerary';

    const stats = await Review.aggregate([
      { $match: { [queryField]: mongoose.Types.ObjectId(id), isActive: true } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating]++;
    });

    res.json({
      success: true,
      data: {
        totalReviews: stats[0].totalReviews,
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review statistics'
    });
  }
});

module.exports = router;
