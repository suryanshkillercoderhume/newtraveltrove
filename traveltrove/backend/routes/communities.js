const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const communityService = require('../services/communityService');

const router = express.Router();

// @route   GET /api/communities
// @desc    Get all communities (with optional search and filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await communityService.getCommunities(req.query);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/communities/:id
// @desc    Get a specific community
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const community = await communityService.getCommunityById(req.params.id);

    res.json({
      success: true,
      data: { community }
    });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/communities
// @desc    Create a new community
// @access  Private
router.post('/', auth, [
  body('name')
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters'),
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn(['adventure', 'culture', 'food', 'nature', 'city', 'beach', 'mountains', 'other'])
    .withMessage('Invalid category'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
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

    const community = await communityService.createCommunity(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: { community }
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/communities/:id
// @desc    Update a community
// @access  Private (Admin only)
router.put('/:id', auth, [
  body('name')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .optional()
    .isIn(['adventure', 'culture', 'food', 'nature', 'city', 'beach', 'mountains', 'other'])
    .withMessage('Invalid category'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
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

    const community = await communityService.updateCommunity(req.params.id, req.body, req.user._id);

    res.json({
      success: true,
      message: 'Community updated successfully',
      data: { community }
    });
  } catch (error) {
    console.error('Update community error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/communities/:id
// @desc    Delete a community
// @access  Private (Creator only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await communityService.deleteCommunity(req.params.id, req.user._id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Delete community error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join a community
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const community = await communityService.joinCommunity(req.params.id, req.user._id);

    res.json({
      success: true,
      message: 'Successfully joined the community',
      data: { community }
    });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/communities/:id/leave
// @desc    Leave a community
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const community = await communityService.leaveCommunity(req.params.id, req.user._id);

    res.json({
      success: true,
      message: 'Successfully left the community',
      data: { community }
    });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/communities/user/my-communities
// @desc    Get user's communities
// @access  Private
router.get('/user/my-communities', auth, async (req, res) => {
  try {
    const communities = await communityService.getUserCommunities(req.user._id);

    res.json({
      success: true,
      data: { communities }
    });
  } catch (error) {
    console.error('Get user communities error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;