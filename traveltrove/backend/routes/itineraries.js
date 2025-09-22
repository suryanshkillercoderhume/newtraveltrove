const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const Itinerary = require('../models/Itinerary');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');

const router = express.Router();

// @route   GET /api/itineraries
// @desc    Get all public itineraries with filters
// @access  Public
router.get('/', [
  query('destination').optional().isMongoId(),
  query('budget').optional().isString(),
  query('travelStyle').optional().isString(),
  query('duration').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['title', 'rating', 'createdAt']),
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
      budget,
      travelStyle,
      duration,
      page = 1,
      limit = 12,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { isPublic: true };
    if (destination) query.destination = destination;
    if (budget) query['budget.type'] = budget;
    if (travelStyle) query.travelStyle = travelStyle;
    if (duration) query['duration.days'] = { $lte: parseInt(duration) };

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const itineraries = await Itinerary.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('destination', 'name location images')
      .populate('createdBy', 'username firstName lastName profilePicture')
      .select('-days -accommodations -transportation -packingList -tips');

    const total = await Itinerary.countDocuments(query);

    res.json({
      success: true,
      data: {
        itineraries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get itineraries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching itineraries'
    });
  }
});

// @route   GET /api/itineraries/my
// @desc    Get user's itineraries
// @access  Private
router.get('/my', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const skip = (page - 1) * limit;
    const itineraries = await Itinerary.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('destination', 'name location images')
      .select('-days -accommodations -transportation -packingList -tips');

    const total = await Itinerary.countDocuments({ createdBy: req.user._id });

    res.json({
      success: true,
      data: {
        itineraries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my itineraries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your itineraries'
    });
  }
});

// @route   GET /api/itineraries/:id
// @desc    Get itinerary by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('destination')
      .populate('createdBy', 'username firstName lastName profilePicture');

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if itinerary is public or user is the creator
    if (!itinerary.isPublic && (!req.user || itinerary.createdBy._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get recent reviews
    const reviews = await Review.find({ itinerary: itinerary._id })
      .populate('user', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        itinerary,
        recentReviews: reviews
      }
    });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching itinerary'
    });
  }
});

// @route   POST /api/itineraries
// @desc    Create new itinerary
// @access  Private
router.post('/', auth, [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('destination').isMongoId().withMessage('Valid destination is required'),
  body('duration.days').isInt({ min: 1, max: 365 }).withMessage('Valid duration is required'),
  body('budget.type').isIn(['Budget', 'Mid-range', 'Luxury']).withMessage('Valid budget type is required'),
  body('travelStyle').isIn(['Adventure', 'Relaxation', 'Cultural', 'Food', 'Nature', 'City', 'Beach', 'Mixed']).withMessage('Valid travel style is required')
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

    // Verify destination exists
    const destination = await Destination.findById(req.body.destination);
    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination not found'
      });
    }

    const itineraryData = {
      ...req.body,
      createdBy: req.user._id
    };

    const itinerary = new Itinerary(itineraryData);
    await itinerary.save();

    await itinerary.populate('destination', 'name location images');
    await itinerary.populate('createdBy', 'username firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Itinerary created successfully',
      data: { itinerary }
    });
  } catch (error) {
    console.error('Create itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating itinerary'
    });
  }
});

// @route   PUT /api/itineraries/:id
// @desc    Update itinerary
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user is the creator
    if (itinerary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this itinerary'
      });
    }

    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('destination', 'name location images')
      .populate('createdBy', 'username firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Itinerary updated successfully',
      data: { itinerary: updatedItinerary }
    });
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating itinerary'
    });
  }
});

// @route   DELETE /api/itineraries/:id
// @desc    Delete itinerary
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user is the creator
    if (itinerary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this itinerary'
      });
    }

    await Itinerary.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting itinerary'
    });
  }
});

// @route   POST /api/itineraries/:id/duplicate
// @desc    Duplicate itinerary
// @access  Private
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalItinerary = await Itinerary.findById(req.params.id);

    if (!originalItinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if itinerary is public or user is the creator
    if (!originalItinerary.isPublic && originalItinerary.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create duplicate
    const duplicateData = originalItinerary.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.createdBy = req.user._id;
    duplicateData.isPublic = false; // Make duplicate private by default

    const duplicateItinerary = new Itinerary(duplicateData);
    await duplicateItinerary.save();

    await duplicateItinerary.populate('destination', 'name location images');
    await duplicateItinerary.populate('createdBy', 'username firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Itinerary duplicated successfully',
      data: { itinerary: duplicateItinerary }
    });
  } catch (error) {
    console.error('Duplicate itinerary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error duplicating itinerary'
    });
  }
});

module.exports = router;
