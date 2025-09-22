const Message = require('../models/Message');
const Community = require('../models/Community');

class MessageService {
  async getMessages(communityId, params = {}) {
    const { page = 1, limit = 20 } = params;

    const messages = await Message.find({ community: communityId, isDeleted: false })
      .populate('sender', 'username firstName lastName profilePicture')
      .populate('replies.sender', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ community: communityId, isDeleted: false });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async sendMessage(communityId, messageData, senderId) {
    const { content, type, travelPlan, imageUrl, linkUrl } = messageData;

    // Validate message type and content
    if (type === 'text' && !content) {
      throw new Error('Text message cannot be empty');
    }
    if (type === 'travel_plan' && (!travelPlan || !travelPlan.destination)) {
      throw new Error('Travel plan requires a destination');
    }
    if (type === 'image' && !imageUrl) {
      throw new Error('Image message requires an image URL');
    }
    if (type === 'link' && !linkUrl) {
      throw new Error('Link message requires a link URL');
    }

    const newMessage = new Message({
      community: communityId,
      sender: senderId,
      content,
      type,
      travelPlan,
      imageUrl,
      linkUrl
    });

    await newMessage.save();
    return await newMessage.populate('sender', 'username firstName lastName profilePicture');
  }

  async editMessage(messageId, content, userId) {
    const message = await Message.findById(messageId);

    if (!message || message.isDeleted) {
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== userId.toString()) {
      throw new Error('Access denied. You can only edit your own messages');
    }

    message.content = content;
    await message.save();

    return await message.populate('sender', 'username firstName lastName profilePicture');
  }

  async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const community = await Community.findById(message.community);
    const isSender = message.sender.toString() === userId.toString();
    const isAdmin = community && community.isAdmin(userId);

    if (!isSender && !isAdmin) {
      throw new Error('Access denied. You can only delete your own messages or be a community admin');
    }

    message.isDeleted = true;
    await message.save();

    return { message: 'Message deleted successfully' };
  }

  async addReaction(messageId, emoji, userId) {
    const message = await Message.findById(messageId);

    if (!message || message.isDeleted) {
      throw new Error('Message not found');
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // User already reacted with this emoji, remove it
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({ emoji, user: userId });
    }

    await message.save();
    return await message.populate('sender', 'username firstName lastName profilePicture');
  }

  async addReply(messageId, content, userId) {
    const message = await Message.findById(messageId);

    if (!message || message.isDeleted) {
      throw new Error('Message not found');
    }

    message.replies.push({ sender: userId, content });
    await message.save();

    return await message.populate('sender', 'username firstName lastName profilePicture')
      .populate('replies.sender', 'username firstName lastName profilePicture');
  }

  async isCommunityMember(communityId, userId) {
    const community = await Community.findById(communityId);
    if (!community) return false;
    return community.members.some(member => member.user.toString() === userId.toString());
  }
}

module.exports = new MessageService();



