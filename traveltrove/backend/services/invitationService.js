const Invitation = require('../models/Invitation');
const Community = require('../models/Community');
const User = require('../models/User');
const nodemailer = require('nodemailer');

class InvitationService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async createInvitation(invitationData, inviterId) {
    const { communityId, email, message } = invitationData;

    // Check if community exists and user is admin
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isAdmin(inviterId)) {
      throw new Error('Access denied. Only admins can send invitations');
    }

    // Check if user is already a member
    const user = await User.findOne({ email });
    if (user && community.isMember(user._id)) {
      throw new Error('User is already a member of this community');
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      community: communityId,
      email,
      status: 'pending'
    });

    if (existingInvitation) {
      throw new Error('Invitation already sent to this email');
    }

    const invitation = new Invitation({
      community: communityId,
      email,
      message,
      inviter: inviterId,
      token: this.generateToken()
    });

    await invitation.save();

    // Send email invitation
    await this.sendInvitationEmail(invitation, community);

    return await invitation.populate('community', 'name description')
      .populate('inviter', 'username firstName lastName');
  }

  async getInvitations(params = {}) {
    const { page = 1, limit = 10, status, email } = params;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (email) {
      query.email = email;
    }

    const invitations = await Invitation.find(query)
      .populate('community', 'name description')
      .populate('inviter', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invitation.countDocuments(query);

    return {
      invitations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalInvitations: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async getInvitationByToken(token) {
    const invitation = await Invitation.findOne({ token })
      .populate('community', 'name description')
      .populate('inviter', 'username firstName lastName');

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation has already been used or expired');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    return invitation;
  }

  async acceptInvitation(token, userId) {
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation has already been used');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Check if user email matches invitation email
    const user = await User.findById(userId);
    if (user.email !== invitation.email) {
      throw new Error('Email does not match invitation');
    }

    // Add user to community
    const community = await Community.findById(invitation.community);
    if (!community) {
      throw new Error('Community not found');
    }

    if (community.isMember(userId)) {
      throw new Error('User is already a member of this community');
    }

    community.members.push({
      user: userId,
      role: 'member',
      joinedAt: new Date()
    });

    await community.save();

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = userId;
    await invitation.save();

    return await invitation.populate('community', 'name description')
      .populate('inviter', 'username firstName lastName');
  }

  async declineInvitation(token) {
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation has already been used');
    }

    invitation.status = 'declined';
    invitation.declinedAt = new Date();
    await invitation.save();

    return { message: 'Invitation declined successfully' };
  }

  async cancelInvitation(invitationId, userId) {
    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.inviter.toString() !== userId.toString()) {
      throw new Error('Access denied. You can only cancel your own invitations');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Cannot cancel a used invitation');
    }

    invitation.status = 'cancelled';
    invitation.cancelledAt = new Date();
    await invitation.save();

    return { message: 'Invitation cancelled successfully' };
  }

  async sendInvitationEmail(invitation, community) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: invitation.email,
      subject: `Invitation to join ${community.name}`,
      html: `
        <h2>You're invited to join ${community.name}!</h2>
        <p>You have been invited to join the community "${community.name}" on TravelTrove.</p>
        <p>${invitation.message || ''}</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/invitation/${invitation.token}">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending error:', error);
      // Don't throw error to prevent invitation creation failure
    }
  }

  generateToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }
}

module.exports = new InvitationService();
