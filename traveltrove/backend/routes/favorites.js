const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const Destination = require('../models/Destination');
const Itinerary = require('../models/Itinerary');

const router = express.Router();

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', auth, [
  query('type').optional().isIn(['destination', 'itinerary']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { type, page = 1, limit = 20 } = req.query;

    // Build query
    let query = { user: req.user._id };
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const favorites = await Favorite.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('destination', 'name location images category averageRating')
      .populate('itinerary', 'title destination duration budget travelStyle averageRating')
      .populate('itinerary.destination', 'name location images');

    const total = await Favorite.countDocuments(query);

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites'
    });
  }
});

// @route   POST /api/favorites
// @desc    Add item to favorites
// @access  Private
router.post('/', auth, [
  body('type').isIn(['destination', 'itinerary']).withMessage('Type must be destination or itinerary'),
  body('destination').optional().isMongoId(),
  body('itinerary').optional().isMongoId(),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('tags').optional().isArray()
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

    const { type, destination, itinerary, notes, tags } = req.body;

    // Check if item is already favorited
    const isFavorited = await Favorite.isFavorited(req.user._id, destination, itinerary);
    if (isFavorited) {
      return res.status(400).json({
        success: false,
        message: 'Item is already in your favorites'
      });
    }

    // Verify destination or itinerary exists
    if (type === 'destination' && destination) {
      const dest = await Destination.findById(destination);
      if (!dest) {
        return res.status(400).json({
          success: false,
          message: 'Destination not found'
        });
      }
    }

    if (type === 'itinerary' && itinerary) {
      const itin = await Itinerary.findById(itinerary);
      if (!itin) {
        return res.status(400).json({
          success: false,
          message: 'Itinerary not found'
        });
      }
    }

    const favoriteData = {
      user: req.user._id,
      type,
      destination: type === 'destination' ? destination : undefined,
      itinerary: type === 'itinerary' ? itinerary : undefined,
      notes,
      tags
    };

    const favorite = new Favorite(favoriteData);
    await favorite.save();

    await favorite.populate('destination', 'name location images category averageRating');
    await favorite.populate('itinerary', 'title destination duration budget travelStyle averageRating');
    await favorite.populate('itinerary.destination', 'name location images');

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: { favorite }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to favorites'
    });
  }
});

// @route   DELETE /api/favorites/:id
// @desc    Remove item from favorites
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    // Check if user owns this favorite
    if (favorite.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this favorite'
      });
    }

    await Favorite.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from favorites'
    });
  }
});

// @route   PUT /api/favorites/:id
// @desc    Update favorite notes and tags
// @access  Private
router.put('/:id', auth, [
  body('notes').optional().isString().isLength({ max: 500 }),
  body('tags').optional().isArray()
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

    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    // Check if user owns this favorite
    if (favorite.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this favorite'
      });
    }

    const updatedFavorite = await Favorite.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes, tags: req.body.tags },
      { new: true, runValidators: true }
    )
      .populate('destination', 'name location images category averageRating')
      .populate('itinerary', 'title destination duration budget travelStyle averageRating')
      .populate('itinerary.destination', 'name location images');

    res.json({
      success: true,
      message: 'Favorite updated successfully',
      data: { favorite: updatedFavorite }
    });
  } catch (error) {
    console.error('Update favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating favorite'
    });
  }
});

// @route   GET /api/favorites/check
// @desc    Check if item is favorited
// @access  Private
router.get('/check', auth, [
  query('destination').optional().isMongoId(),
  query('itinerary').optional().isMongoId()
], async (req, res) => {
  try {
    const { destination, itinerary } = req.query;

    if (!destination && !itinerary) {
      return res.status(400).json({
        success: false,
        message: 'Either destination or itinerary ID is required'
      });
    }

    const isFavorited = await Favorite.isFavorited(req.user._id, destination, itinerary);

    res.json({
      success: true,
      data: { isFavorited }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking favorite status'
    });
  }
});

// @route   POST /api/favorites/toggle
// @desc    Toggle favorite status
// @access  Private
router.post('/toggle', auth, [
  body('type').isIn(['destination', 'itinerary']).withMessage('Type must be destination or itinerary'),
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

    const { type, destination, itinerary } = req.body;

    // Check if item is already favorited
    const isFavorited = await Favorite.isFavorited(req.user._id, destination, itinerary);

    if (isFavorited) {
      // Remove from favorites
      const favorite = await Favorite.findOne({
        user: req.user._id,
        destination: destination || undefined,
        itinerary: itinerary || undefined
      });

      await Favorite.findByIdAndDelete(favorite._id);

      res.json({
        success: true,
        message: 'Removed from favorites',
        data: { isFavorited: false }
      });
    } else {
      // Add to favorites
      const favoriteData = {
        user: req.user._id,
        type,
        destination: type === 'destination' ? destination : undefined,
        itinerary: type === 'itinerary' ? itinerary : undefined
      };

      const favorite = new Favorite(favoriteData);
      await favorite.save();

      await favorite.populate('destination', 'name location images category averageRating');
      await favorite.populate('itinerary', 'title destination duration budget travelStyle averageRating');
      await favorite.populate('itinerary.destination', 'name location images');

      res.json({
        success: true,
        message: 'Added to favorites',
        data: { isFavorited: true, favorite }
      });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite status'
    });
  }
});

module.exports = router;
