const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const messageService = require('../services/messageService');

const router = express.Router();

// @route   GET /api/messages/:communityId
// @desc    Get messages for a specific community
// @access  Private (Community Members Only)
router.get('/:communityId', auth, async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!await messageService.isCommunityMember(communityId, req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Not a community member.' 
      });
    }

    const result = await messageService.getMessages(communityId, { page, limit });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/messages/:communityId
// @desc    Send a new message to a community
// @access  Private (Community Members Only)
router.post('/:communityId', auth, [
  body('content').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
  body('type').isIn(['text', 'travel_plan', 'image', 'link']).withMessage('Invalid message type'),
  body('travelPlan.destination').optional().notEmpty().withMessage('Travel plan destination is required'),
  body('travelPlan.dates.start').optional().isISO8601().toDate().withMessage('Valid start date is required'),
  body('travelPlan.dates.end').optional().isISO8601().toDate().withMessage('Valid end date is required'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('linkUrl').optional().isURL().withMessage('Invalid link URL'),
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

    const { communityId } = req.params;

    if (!await messageService.isCommunityMember(communityId, req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Not a community member.' 
      });
    }

    const message = await messageService.sendMessage(communityId, req.body, req.user._id);

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully', 
      data: { message } 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   PUT /api/messages/:messageId
// @desc    Edit a message
// @access  Private (Message Sender Only)
router.put('/:messageId', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
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

    const { messageId } = req.params;
    const { content } = req.body;

    const message = await messageService.editMessage(messageId, content, req.user._id);

    res.json({ 
      success: true, 
      message: 'Message updated successfully', 
      data: { message } 
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (soft delete)
// @access  Private (Message Sender or Community Admin)
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await messageService.deleteMessage(messageId, req.user._id);

    res.json({ 
      success: true, 
      message: result.message 
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/messages/:messageId/reactions
// @desc    Add a reaction to a message
// @access  Private (Community Members Only)
router.post('/:messageId/reactions', auth, [
  body('emoji').notEmpty().withMessage('Emoji is required'),
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

    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await messageService.addReaction(messageId, emoji, req.user._id);

    res.json({ 
      success: true, 
      message: 'Reaction updated successfully', 
      data: { message } 
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/messages/:messageId/replies
// @desc    Add a reply to a message
// @access  Private (Community Members Only)
router.post('/:messageId/replies', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Reply content must be between 1 and 500 characters'),
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

    const { messageId } = req.params;
    const { content } = req.body;

    const message = await messageService.addReply(messageId, content, req.user._id);

    res.status(201).json({ 
      success: true, 
      message: 'Reply added successfully', 
      data: { message } 
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;