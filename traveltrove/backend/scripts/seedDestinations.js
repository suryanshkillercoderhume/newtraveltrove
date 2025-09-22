const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Destination = require('../models/Destination');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDestinations = async () => {
  try {
    console.log('🌱 Starting to seed destinations...');

    // Get a user to be the creator
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please run the main seed script first.');
      return;
    }

    // Clear existing destinations
    await Destination.deleteMany({});
    console.log('🗑️  Cleared existing destinations');

    // Sample destinations
    const destinations = [
      {
        name: 'Bali, Indonesia',
        description: 'Bali is a beautiful Indonesian island known for its stunning beaches, ancient temples, vibrant culture, and lush rice terraces. It offers a perfect blend of relaxation, adventure, and spiritual experiences.',
        summary: 'A tropical paradise with stunning beaches, ancient temples, and vibrant culture.',
        location: {
          country: 'Indonesia',
          city: 'Bali',
          coordinates: { latitude: -8.3405, longitude: 115.0920 }
        },
        category: 'Beach',
        tags: ['beach', 'temple', 'culture', 'rice terraces', 'spiritual'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=400&fit=crop',
            caption: 'Beautiful Balinese beach',
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=400&fit=crop',
            caption: 'Traditional Balinese temple'
          }
        ],
        history: 'Bali has a rich history dating back over 2,000 years. The island was influenced by Indian culture, particularly Hinduism, which arrived around the 1st century AD. The Majapahit Empire ruled Bali from the 13th to 16th centuries, leaving behind magnificent temples and cultural traditions that continue to this day.',
        culture: 'Balinese culture is deeply rooted in Hinduism, with daily offerings, ceremonies, and festivals being an integral part of life. The island is famous for its traditional dance, music, and art forms. The Balinese people are known for their warm hospitality and strong community bonds.',
        attractions: [
          {
            name: 'Tanah Lot Temple',
            description: 'A famous sea temple perched on a rock formation in the ocean.',
            type: 'Temple',
            location: 'Beraban, Tabanan Regency'
          },
          {
            name: 'Tegallalang Rice Terraces',
            description: 'Stunning stepped rice terraces with traditional irrigation systems.',
            type: 'Landmark',
            location: 'Tegallalang, Gianyar Regency'
          },
          {
            name: 'Ubud Monkey Forest',
            description: 'Sacred forest sanctuary home to hundreds of long-tailed macaques.',
            type: 'Park',
            location: 'Ubud, Gianyar Regency'
          }
        ],
        lodging: [
          {
            name: 'The St. Regis Bali Resort',
            type: 'Resort',
            priceRange: 'Luxury',
            description: 'Luxury beachfront resort with world-class amenities and service.',
            location: 'Nusa Dua',
            rating: 4.8
          },
          {
            name: 'Ubud Hanging Gardens',
            type: 'Resort',
            priceRange: 'Luxury',
            description: 'Boutique resort with infinity pools overlooking the jungle.',
            location: 'Ubud',
            rating: 4.7
          }
        ],
        dining: [
          {
            name: 'Locavore',
            cuisine: 'Modern Indonesian',
            priceRange: 'Fine Dining',
            description: 'Award-winning restaurant focusing on local ingredients and innovative techniques.',
            location: 'Ubud',
            rating: 4.9
          },
          {
            name: 'Warung Babi Guling Ibu Oka',
            cuisine: 'Balinese',
            priceRange: 'Budget',
            description: 'Famous for traditional Balinese suckling pig.',
            location: 'Ubud',
            rating: 4.5
          }
        ],
        activities: [
          {
            name: 'Surfing at Kuta Beach',
            type: 'Adventure',
            description: 'Learn to surf at one of Bali\'s most famous beaches.',
            duration: 'Half day',
            priceRange: 'Mid-range',
            location: 'Kuta'
          },
          {
            name: 'Temple Tour',
            type: 'Cultural',
            description: 'Visit ancient temples and learn about Balinese Hinduism.',
            duration: 'Full day',
            priceRange: 'Mid-range',
            location: 'Various locations'
          }
        ],
        bestTimeToVisit: 'The best time to visit Bali is during the dry season from April to October, with July and August being the peak months. The weather is sunny and dry, perfect for beach activities and sightseeing.',
        travelTips: [
          'Respect local customs and dress modestly when visiting temples',
          'Learn basic Indonesian phrases to communicate with locals',
          'Try local transportation like bemo or rent a scooter for flexibility',
          'Carry cash as many places don\'t accept cards',
          'Stay hydrated and use sunscreen due to the tropical climate'
        ],
        createdBy: user._id
      },
      {
        name: 'Paris, France',
        description: 'Paris, the City of Light, is one of the world\'s most romantic and culturally rich destinations. Known for its iconic landmarks, world-class museums, exquisite cuisine, and charming neighborhoods.',
        summary: 'The romantic capital of France with iconic landmarks, world-class museums, and exquisite cuisine.',
        location: {
          country: 'France',
          city: 'Paris',
          coordinates: { latitude: 48.8566, longitude: 2.3522 }
        },
        category: 'City',
        tags: ['romantic', 'museums', 'art', 'cuisine', 'landmarks'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=400&fit=crop',
            caption: 'Eiffel Tower at sunset',
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=400&fit=crop',
            caption: 'Louvre Museum'
          }
        ],
        history: 'Paris has been a major European city for over 2,000 years. Founded by the Parisii tribe, it became the capital of France in the 12th century. The city has witnessed major historical events including the French Revolution, the Belle Époque, and both World Wars.',
        culture: 'Paris is a global center for art, fashion, gastronomy, and culture. The city is home to world-renowned museums, theaters, and cultural institutions. Parisian culture emphasizes art, literature, philosophy, and the art of living well.',
        attractions: [
          {
            name: 'Eiffel Tower',
            description: 'Iconic iron lattice tower and symbol of Paris.',
            type: 'Landmark',
            location: '7th arrondissement'
          },
          {
            name: 'Louvre Museum',
            description: 'World\'s largest art museum and historic monument.',
            type: 'Museum',
            location: '1st arrondissement'
          },
          {
            name: 'Notre-Dame Cathedral',
            description: 'Medieval Catholic cathedral with Gothic architecture.',
            type: 'Landmark',
            location: '4th arrondissement'
          }
        ],
        lodging: [
          {
            name: 'The Ritz Paris',
            type: 'Hotel',
            priceRange: 'Luxury',
            description: 'Legendary luxury hotel in Place Vendôme.',
            location: '1st arrondissement',
            rating: 4.9
          },
          {
            name: 'Hotel des Grands Boulevards',
            type: 'Hotel',
            priceRange: 'Mid-range',
            description: 'Boutique hotel with Parisian charm.',
            location: '2nd arrondissement',
            rating: 4.6
          }
        ],
        dining: [
          {
            name: 'L\'Ambroisie',
            cuisine: 'French',
            priceRange: 'Fine Dining',
            description: 'Three-Michelin-starred restaurant serving classic French cuisine.',
            location: '4th arrondissement',
            rating: 4.9
          },
          {
            name: 'Le Comptoir du Relais',
            cuisine: 'French Bistro',
            priceRange: 'Mid-range',
            description: 'Popular bistro known for traditional French dishes.',
            location: '6th arrondissement',
            rating: 4.7
          }
        ],
        activities: [
          {
            name: 'Seine River Cruise',
            type: 'Cultural',
            description: 'Scenic boat tour along the Seine River.',
            duration: '1-2 hours',
            priceRange: 'Mid-range',
            location: 'Various departure points'
          },
          {
            name: 'Art Museum Tour',
            type: 'Cultural',
            description: 'Visit world-famous museums and galleries.',
            duration: 'Full day',
            priceRange: 'Budget',
            location: 'Various museums'
          }
        ],
        bestTimeToVisit: 'The best time to visit Paris is during spring (April to June) and fall (September to November) when the weather is mild and the city is less crowded. Summer is popular but can be hot and crowded.',
        travelTips: [
          'Learn basic French phrases - locals appreciate the effort',
          'Purchase a Paris Museum Pass for discounted entry to major attractions',
          'Use the efficient metro system to get around the city',
          'Make reservations for popular restaurants in advance',
          'Be aware of pickpockets in tourist areas'
        ],
        createdBy: user._id
      },
      {
        name: 'Tokyo, Japan',
        description: 'Tokyo is a fascinating blend of traditional Japanese culture and cutting-edge modernity. This bustling metropolis offers everything from ancient temples to futuristic technology, world-class cuisine, and unique cultural experiences.',
        summary: 'A vibrant metropolis blending traditional Japanese culture with cutting-edge modernity.',
        location: {
          country: 'Japan',
          city: 'Tokyo',
          coordinates: { latitude: 35.6762, longitude: 139.6503 }
        },
        category: 'City',
        tags: ['modern', 'traditional', 'technology', 'cuisine', 'temples'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=400&fit=crop',
            caption: 'Tokyo skyline with Mount Fuji',
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=400&fit=crop',
            caption: 'Traditional Tokyo street'
          }
        ],
        history: 'Tokyo, originally known as Edo, became the capital of Japan in 1603 when Tokugawa Ieyasu established his shogunate there. The city grew into one of the world\'s largest urban centers and was renamed Tokyo (Eastern Capital) in 1868 when the emperor moved there.',
        culture: 'Tokyo culture is a unique blend of traditional Japanese customs and modern innovation. The city is known for its politeness, efficiency, and respect for tradition while embracing technological advancement and global influences.',
        attractions: [
          {
            name: 'Senso-ji Temple',
            description: 'Tokyo\'s oldest temple and a major Buddhist center.',
            type: 'Temple',
            location: 'Asakusa'
          },
          {
            name: 'Tokyo Skytree',
            description: 'Tallest structure in Japan with observation decks.',
            type: 'Landmark',
            location: 'Sumida'
          },
          {
            name: 'Tsukiji Outer Market',
            description: 'Famous fish market with fresh seafood and street food.',
            type: 'Market',
            location: 'Tsukiji'
          }
        ],
        lodging: [
          {
            name: 'The Ritz-Carlton Tokyo',
            type: 'Hotel',
            priceRange: 'Luxury',
            description: 'Luxury hotel with stunning city views.',
            location: 'Roppongi',
            rating: 4.8
          },
          {
            name: 'Shibuya Sky Hotel',
            type: 'Hotel',
            priceRange: 'Mid-range',
            description: 'Modern hotel in the heart of Shibuya.',
            location: 'Shibuya',
            rating: 4.5
          }
        ],
        dining: [
          {
            name: 'Sukiyabashi Jiro',
            cuisine: 'Sushi',
            priceRange: 'Fine Dining',
            description: 'World-famous sushi restaurant (reservations required).',
            location: 'Ginza',
            rating: 4.9
          },
          {
            name: 'Ramen Nagi',
            cuisine: 'Ramen',
            priceRange: 'Budget',
            description: 'Popular ramen chain with authentic flavors.',
            location: 'Multiple locations',
            rating: 4.6
          }
        ],
        activities: [
          {
            name: 'Cherry Blossom Viewing',
            type: 'Cultural',
            description: 'Experience hanami (cherry blossom viewing) in spring.',
            duration: '2-3 hours',
            priceRange: 'Free',
            location: 'Various parks'
          },
          {
            name: 'Robot Restaurant Show',
            type: 'Cultural',
            description: 'Unique entertainment experience with robots and neon lights.',
            duration: '90 minutes',
            priceRange: 'Expensive',
            location: 'Shinjuku'
          }
        ],
        bestTimeToVisit: 'The best times to visit Tokyo are during spring (March to May) for cherry blossoms and fall (September to November) for pleasant weather. Avoid the rainy season in June and July.',
        travelTips: [
          'Learn basic Japanese phrases and bowing etiquette',
          'Carry cash as many places don\'t accept foreign cards',
          'Use the efficient JR Pass for train travel',
          'Try local convenience stores (konbini) for quick meals',
          'Be respectful in temples and remove shoes when required'
        ],
        createdBy: user._id
      }
    ];

    const createdDestinations = await Destination.insertMany(destinations);
    console.log(`🏝️  Created ${createdDestinations.length} destinations`);

    console.log('✅ Destinations seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Destinations: ${createdDestinations.length}`);
    console.log('\n🌐 You can now search and view destination guides!');

  } catch (error) {
    console.error('❌ Error seeding destinations:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDestinations();
