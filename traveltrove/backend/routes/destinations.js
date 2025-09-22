const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');

const router = express.Router();

// @route   GET /api/destinations/search
// @desc    Search destinations
// @access  Public
router.get('/search', [
  query('q').optional().isString().trim(),
  query('category').optional().isString(),
  query('country').optional().isString(),
  query('city').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['name', 'rating', 'createdAt']),
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
      q,
      category,
      country,
      city,
      page = 1,
      limit = 12,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    // Build search query
    let searchQuery = { isActive: true };

    // Text search
    if (q) {
      searchQuery.$text = { $search: q };
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Location filters
    if (country) {
      searchQuery['location.country'] = new RegExp(country, 'i');
    }
    if (city) {
      searchQuery['location.city'] = new RegExp(city, 'i');
    }

    // Build sort object
    let sort = {};
    if (q && sortBy === 'rating') {
      // For text search, use text score
      sort = { score: { $meta: 'textScore' }, averageRating: -1 };
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute search
    const skip = (page - 1) * limit;
    const destinations = await Destination.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName profilePicture')
      .select('-history -culture -attractions -lodging -dining -activities -travelTips');

    const total = await Destination.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        destinations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching destinations'
    });
  }
});

// @route   GET /api/destinations
// @desc    Get all destinations with filters
// @access  Public
router.get('/', [
  query('category').optional().isString(),
  query('country').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['name', 'rating', 'createdAt']),
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
      category,
      country,
      page = 1,
      limit = 12,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { isActive: true };
    if (category) query.category = category;
    if (country) query['location.country'] = new RegExp(country, 'i');

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const destinations = await Destination.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName lastName profilePicture')
      .select('-history -culture -attractions -lodging -dining -activities -travelTips');

    const total = await Destination.countDocuments(query);

    res.json({
      success: true,
      data: {
        destinations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching destinations'
    });
  }
});

// @route   GET /api/destinations/:id
// @desc    Get destination by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName profilePicture');

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Get recent reviews
    const reviews = await Review.find({ destination: destination._id })
      .populate('user', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        destination,
        recentReviews: reviews
      }
    });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching destination'
    });
  }
});

// @route   POST /api/destinations
// @desc    Create new destination
// @access  Private
router.post('/', auth, [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('summary').notEmpty().withMessage('Summary is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('category').isIn(['Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Nature', 'Historical', 'Food', 'Nightlife', 'Family', 'Romantic', 'Budget', 'Luxury']).withMessage('Invalid category')
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

    const destinationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const destination = new Destination(destinationData);
    await destination.save();

    await destination.populate('createdBy', 'username firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: { destination }
    });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating destination'
    });
  }
});

// @route   PUT /api/destinations/:id
// @desc    Update destination
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check if user is the creator
    if (destination.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this destination'
      });
    }

    const updatedDestination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Destination updated successfully',
      data: { destination: updatedDestination }
    });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating destination'
    });
  }
});

// @route   DELETE /api/destinations/:id
// @desc    Delete destination
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check if user is the creator
    if (destination.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this destination'
      });
    }

    await Destination.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting destination'
    });
  }
});

// @route   GET /api/destinations/categories
// @desc    Get all destination categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Destination.distinct('category');
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @route   GET /api/destinations/countries
// @desc    Get all countries
// @access  Public
router.get('/countries', async (req, res) => {
  try {
    const countries = await Destination.distinct('location.country');
    res.json({
      success: true,
      data: { countries: countries.sort() }
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching countries'
    });
  }
});

module.exports = router;
