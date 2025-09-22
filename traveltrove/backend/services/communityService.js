const Community = require('../models/Community');
const User = require('../models/User');

class CommunityService {
  async createCommunity(communityData, creatorId) {
    const community = new Community({
      ...communityData,
      creator: creatorId,
      members: [{ user: creatorId, role: 'admin', joinedAt: new Date() }]
    });

    await community.save();
    return await this.getCommunityById(community._id);
  }

  async getCommunities(params = {}) {
    const { page = 1, limit = 10, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const communities = await Community.find(query)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('members.user', 'username firstName lastName profilePicture')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Community.countDocuments(query);

    return {
      communities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCommunities: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async getCommunityById(communityId) {
    const community = await Community.findById(communityId)
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('members.user', 'username firstName lastName profilePicture');

    if (!community) {
      throw new Error('Community not found');
    }

    return community;
  }

  async updateCommunity(communityId, updateData, userId) {
    const community = await Community.findById(communityId);
    
    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isAdmin(userId)) {
      throw new Error('Access denied. Only admins can update community');
    }

    Object.assign(community, updateData);
    await community.save();
    
    return await this.getCommunityById(communityId);
  }

  async deleteCommunity(communityId, userId) {
    const community = await Community.findById(communityId);
    
    if (!community) {
      throw new Error('Community not found');
    }

    if (community.creator.toString() !== userId.toString()) {
      throw new Error('Access denied. Only the creator can delete the community');
    }

    await Community.findByIdAndDelete(communityId);
    return { message: 'Community deleted successfully' };
  }

  async joinCommunity(communityId, userId) {
    const community = await Community.findById(communityId);
    
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
    return await this.getCommunityById(communityId);
  }

  async leaveCommunity(communityId, userId) {
    const community = await Community.findById(communityId);
    
    if (!community) {
      throw new Error('Community not found');
    }

    if (!community.isMember(userId)) {
      throw new Error('User is not a member of this community');
    }

    if (community.creator.toString() === userId.toString()) {
      throw new Error('Community creator cannot leave the community');
    }

    community.members = community.members.filter(
      member => member.user.toString() !== userId.toString()
    );

    await community.save();
    return await this.getCommunityById(communityId);
  }

  async getUserCommunities(userId) {
    const communities = await Community.find({
      'members.user': userId
    })
      .populate('creator', 'username firstName lastName profilePicture')
      .populate('members.user', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 });

    return communities;
  }
}

module.exports = new CommunityService();



