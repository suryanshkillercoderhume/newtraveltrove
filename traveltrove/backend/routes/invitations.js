const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const invitationService = require('../services/invitationService');

const router = express.Router();

// @route   POST /api/invitations
// @desc    Create a new invitation
// @access  Private (Community Admin)
router.post('/', auth, [
  body('communityId')
    .isMongoId()
    .withMessage('Valid community ID is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
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

    const invitation = await invitationService.createInvitation(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: { invitation }
    });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/invitations
// @desc    Get invitations (with optional filters)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const result = await invitationService.getInvitations(req.query);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/invitations/token/:token
// @desc    Get invitation by token
// @access  Public
router.get('/token/:token', async (req, res) => {
  try {
    const invitation = await invitationService.getInvitationByToken(req.params.token);

    res.json({
      success: true,
      data: { invitation }
    });
  } catch (error) {
    console.error('Get invitation by token error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/invitations/:token/accept
// @desc    Accept an invitation
// @access  Private
router.post('/:token/accept', auth, async (req, res) => {
  try {
    const invitation = await invitationService.acceptInvitation(req.params.token, req.user._id);

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: { invitation }
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/invitations/:token/decline
// @desc    Decline an invitation
// @access  Public
router.post('/:token/decline', async (req, res) => {
  try {
    const result = await invitationService.declineInvitation(req.params.token);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/invitations/:id
// @desc    Cancel an invitation
// @access  Private (Inviter only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await invitationService.cancelInvitation(req.params.id, req.user._id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;