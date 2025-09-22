const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Community = require('../models/Community');
const Invitation = require('../models/Invitation');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed the database...');

    // Clear existing data
    await User.deleteMany({});
    await Community.deleteMany({});
    await Invitation.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create sample users
    const users = [
      {
        username: 'alice_traveler',
        email: 'alice@example.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Johnson',
        bio: 'Passionate about adventure travel and photography. Love exploring hidden gems around the world!',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'bob_explorer',
        email: 'bob@example.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Smith',
        bio: 'Budget traveler who believes the best experiences come from connecting with locals.',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'charlie_photographer',
        email: 'charlie@example.com',
        password: 'password123',
        firstName: 'Charlie',
        lastName: 'Brown',
        bio: 'Professional travel photographer capturing the beauty of cultures worldwide.',
        profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'diana_foodie',
        email: 'diana@example.com',
        password: 'password123',
        firstName: 'Diana',
        lastName: 'Wilson',
        bio: 'Food enthusiast traveling the world one dish at a time. Always looking for authentic local cuisine.',
        profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'eve_solo',
        email: 'eve@example.com',
        password: 'password123',
        firstName: 'Eve',
        lastName: 'Davis',
        bio: 'Solo female traveler sharing tips and experiences from around the globe.',
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'frank_family',
        email: 'frank@example.com',
        password: 'password123',
        firstName: 'Frank',
        lastName: 'Miller',
        bio: 'Family man exploring the world with kids. Creating memories that last a lifetime.',
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'grace_luxury',
        email: 'grace@example.com',
        password: 'password123',
        firstName: 'Grace',
        lastName: 'Taylor',
        bio: 'Luxury travel consultant helping others experience the finest destinations in style.',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'henry_business',
        email: 'henry@example.com',
        password: 'password123',
        firstName: 'Henry',
        lastName: 'Anderson',
        bio: 'Business traveler who makes the most of every trip by exploring local culture.',
        profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
      }
    ];

    // Create users individually to trigger pre-save hooks for password hashing
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create sample communities
    const communities = [
      {
        name: 'Adventure Seekers',
        description: 'For thrill-seekers who love extreme sports, hiking, and adrenaline-pumping adventures around the world.',
        creator: createdUsers[0]._id,
        category: 'Adventure',
        location: {
          country: 'Global',
          city: 'Worldwide'
        },
        tags: ['hiking', 'climbing', 'extreme sports', 'adventure'],
        rules: [
          'Share only adventure-related content',
          'Be respectful to fellow adventurers',
          'Include safety information in your posts',
          'No spam or promotional content'
        ],
        coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=400&fit=crop',
        maxMembers: 200
      },
      {
        name: 'Food & Culture Explorers',
        description: 'Discover authentic local cuisines and cultural experiences from every corner of the world.',
        creator: createdUsers[3]._id,
        category: 'Food & Dining',
        location: {
          country: 'Global',
          city: 'Worldwide'
        },
        tags: ['food', 'culture', 'local cuisine', 'traditions'],
        rules: [
          'Share authentic food experiences',
          'Include location and restaurant details',
          'Respect cultural differences',
          'No food waste promotion'
        ],
        coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
        maxMembers: 150
      },
      {
        name: 'Solo Female Travelers',
        description: 'A safe space for women traveling alone to share experiences, tips, and support each other.',
        creator: createdUsers[4]._id,
        category: 'Solo Travel',
        location: {
          country: 'Global',
          city: 'Worldwide'
        },
        tags: ['solo travel', 'women', 'safety', 'empowerment'],
        rules: [
          'Women only community',
          'Share safety tips and experiences',
          'Be supportive and encouraging',
          'Respect privacy and personal information'
        ],
        coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
        maxMembers: 100
      },
      {
        name: 'Budget Backpackers',
        description: 'Tips, tricks, and experiences for traveling the world on a budget without compromising on adventure.',
        creator: createdUsers[1]._id,
        category: 'Budget Travel',
        location: {
          country: 'Global',
          city: 'Worldwide'
        },
        tags: ['budget', 'backpacking', 'hostels', 'cheap travel'],
        rules: [
          'Share budget-friendly tips',
          'Include cost breakdowns when possible',
          'Help fellow budget travelers',
          'No luxury travel content'
        ],
        coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
        maxMembers: 300
      },
      {
        name: 'Travel Photography Enthusiasts',
        description: 'Showcase your travel photography and learn from other passionate travel photographers.',
        creator: createdUsers[2]._id,
        category: 'Photography',
        location: {
          country: 'Global',
          city: 'Worldwide'
        },
        tags: ['photography', 'travel photos', 'camera gear', 'editing'],
        rules: [
          'Share original travel photography only',
          'Include camera settings and location',
          'Provide constructive feedback',
          'Credit photographers when sharing'
        ],
        coverImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=400&fit=crop',
        maxMembers: 250
      },
      {
        name: 'Family Travel Adventures',
        description: 'Creating unforgettable memories with your family while exploring the world together.',
        creator: createdUsers[5]._id,
        category: 'Family Travel',
        location: {
          country: 'Global',
          city: 'Worldwide'
        },
        tags: ['family', 'kids', 'family-friendly', 'memories'],
        rules: [
          'Share family-friendly destinations',
          'Include age-appropriate activities',
          'Respect children\'s privacy in photos',
          'Be supportive of family travel challenges'
        ],
        coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
        maxMembers: 180
      },
      {
        name: 'Luxury Travel Connoisseurs',
        description: 'Experience the finest destinations, accommodations, and services the world has to offer.',
        creator: createdUsers[6]._id,
        category: 'Luxury Travel',
        location: {
          country: 'Global',
          city: 'Worldwide'
        },
        tags: ['luxury', 'five-star', 'premium', 'exclusive'],
        rules: [
          'Share luxury travel experiences',
          'Include detailed reviews of services',
          'Respect privacy of exclusive locations',
          'No budget travel content'
        ],
        coverImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=400&fit=crop',
        maxMembers: 120
      },
      {
        name: 'Business Travel Network',
        description: 'Making the most of business trips by discovering local gems and networking with fellow business travelers.',
        creator: createdUsers[7]._id,
        category: 'Business Travel',
        location: {
          country: 'Global',
          city: 'Worldwide'
        },
        tags: ['business', 'networking', 'efficiency', 'work-life balance'],
        rules: [
          'Share business travel tips',
          'Network professionally',
          'Include practical information',
          'Respect business confidentiality'
        ],
        coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop',
        maxMembers: 200
      }
    ];

    // Add members to communities
    for (let i = 0; i < communities.length; i++) {
      const community = communities[i];
      const creator = createdUsers[i];
      
      // Add creator as admin
      community.members = [{
        user: creator._id,
        role: 'admin',
        joinedAt: new Date()
      }];

      // Add some random members to each community
      const otherUsers = createdUsers.filter(user => user._id.toString() !== creator._id.toString());
      const numMembers = Math.floor(Math.random() * 5) + 2; // 2-6 additional members
      const selectedMembers = otherUsers.sort(() => 0.5 - Math.random()).slice(0, numMembers);

      selectedMembers.forEach(user => {
        community.members.push({
          user: user._id,
          role: 'member',
          joinedAt: new Date()
        });
      });
    }

    const createdCommunities = await Community.insertMany(communities);
    console.log(`🏘️  Created ${createdCommunities.length} communities`);

    // Update users with their communities
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const userCommunities = createdCommunities.filter(community => 
        community.members.some(member => member.user.toString() === user._id.toString())
      );
      
      await User.findByIdAndUpdate(user._id, {
        communities: userCommunities.map(community => community._id)
      });
    }

    // Create sample invitations
    const invitations = [
      {
        community: createdCommunities[0]._id,
        inviter: createdUsers[0]._id,
        inviteeEmail: 'newuser1@example.com',
        token: 'invite-token-1',
        message: 'Join us for amazing adventure experiences!',
        status: 'pending'
      },
      {
        community: createdCommunities[1]._id,
        inviter: createdUsers[3]._id,
        inviteeEmail: 'newuser2@example.com',
        token: 'invite-token-2',
        message: 'Come explore the world of food and culture with us!',
        status: 'pending'
      },
      {
        community: createdCommunities[2]._id,
        inviter: createdUsers[4]._id,
        inviteeEmail: 'newuser3@example.com',
        token: 'invite-token-3',
        message: 'A safe space for solo female travelers to connect and share experiences.',
        status: 'pending'
      }
    ];

    const createdInvitations = await Invitation.insertMany(invitations);
    console.log(`📧 Created ${createdInvitations.length} sample invitations`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Communities: ${createdCommunities.length}`);
    console.log(`- Invitations: ${createdInvitations.length}`);
    console.log('\n🔑 Test Accounts:');
    console.log('Email: alice@example.com | Password: password123');
    console.log('Email: bob@example.com | Password: password123');
    console.log('Email: charlie@example.com | Password: password123');
    console.log('\n🌐 You can now start the application and test the features!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
