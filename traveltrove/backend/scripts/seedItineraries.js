const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Destination = require('../models/Destination');
const Itinerary = require('../models/Itinerary');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedItineraries = async () => {
  try {
    console.log('🌱 Starting to seed itineraries...');

    // Get users and destinations
    const users = await User.find();
    const destinations = await Destination.find();
    
    if (users.length === 0) {
      console.log('❌ No users found. Please run the main seed script first.');
      return;
    }
    
    if (destinations.length === 0) {
      console.log('❌ No destinations found. Please run the destinations seed script first.');
      return;
    }

    // Clear existing itineraries
    await Itinerary.deleteMany({});
    console.log('🗑️  Cleared existing itineraries');

    // Sample itineraries
    const itineraries = [
      {
        title: 'Bali Adventure: 7 Days of Culture and Beaches',
        description: 'Experience the best of Bali with this comprehensive 7-day itinerary covering temples, beaches, rice terraces, and local culture.',
        destination: destinations.find(d => d.name === 'Bali, Indonesia')._id,
        duration: { days: 7 },
        budget: { type: 'Mid-range' },
        travelStyle: 'Mixed',
        groupSize: 'Couple',
        days: [
          {
            dayNumber: 1,
            activities: [
              {
                time: '9:00 AM',
                activity: {
                  name: 'Arrival at Denpasar Airport',
                  description: 'Arrive at Ngurah Rai International Airport and transfer to hotel',
                  type: 'Transportation',
                  location: 'Denpasar',
                  duration: '2 hours',
                  cost: 25,
                  notes: 'Pre-arrange airport transfer'
                }
              },
              {
                time: '2:00 PM',
                activity: {
                  name: 'Check-in at Hotel',
                  description: 'Settle in and relax after long flight',
                  type: 'Accommodation',
                  location: 'Ubud',
                  duration: '1 hour',
                  cost: 0,
                  notes: 'Take time to rest and freshen up'
                }
              },
              {
                time: '4:00 PM',
                activity: {
                  name: 'Ubud Monkey Forest',
                  description: 'Visit the sacred monkey forest and explore the temple',
                  type: 'Sightseeing',
                  location: 'Ubud',
                  duration: '2 hours',
                  cost: 5,
                  notes: 'Be careful with belongings around monkeys'
                }
              }
            ],
            notes: 'First day - take it easy and adjust to the time zone'
          },
          {
            dayNumber: 2,
            activities: [
              {
                time: '8:00 AM',
                activity: {
                  name: 'Tegallalang Rice Terraces',
                  description: 'Visit the famous rice terraces and learn about traditional farming',
                  type: 'Sightseeing',
                  location: 'Tegallalang',
                  duration: '3 hours',
                  cost: 10,
                  notes: 'Best lighting in the morning'
                }
              },
              {
                time: '12:00 PM',
                activity: {
                  name: 'Lunch at Local Warung',
                  description: 'Try authentic Balinese cuisine',
                  type: 'Dining',
                  location: 'Tegallalang',
                  duration: '1 hour',
                  cost: 15,
                  notes: 'Try the babi guling (suckling pig)'
                }
              },
              {
                time: '2:00 PM',
                activity: {
                  name: 'Tirta Empul Temple',
                  description: 'Sacred water temple for purification rituals',
                  type: 'Cultural',
                  location: 'Tampaksiring',
                  duration: '2 hours',
                  cost: 5,
                  notes: 'Bring a sarong and change of clothes'
                }
              }
            ],
            notes: 'Cultural immersion day - dress modestly for temples'
          },
          {
            dayNumber: 3,
            activities: [
              {
                time: '6:00 AM',
                activity: {
                  name: 'Mount Batur Sunrise Trek',
                  description: 'Early morning hike to watch sunrise from active volcano',
                  type: 'Adventure',
                  location: 'Kintamani',
                  duration: '6 hours',
                  cost: 50,
                  notes: 'Very early start - bring warm clothes'
                }
              },
              {
                time: '1:00 PM',
                activity: {
                  name: 'Hot Spring Relaxation',
                  description: 'Soak in natural hot springs after the trek',
                  type: 'Relaxation',
                  location: 'Batur Natural Hot Spring',
                  duration: '2 hours',
                  cost: 20,
                  notes: 'Perfect way to relax after the hike'
                }
              }
            ],
            notes: 'Adventure day - prepare for early morning and physical activity'
          }
        ],
        accommodations: [
          {
            name: 'Ubud Hanging Gardens',
            type: 'Resort',
            checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
            checkOut: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            location: 'Ubud',
            cost: 300,
            notes: 'Luxury resort with infinity pools'
          }
        ],
        transportation: [
          {
            type: 'Flight',
            from: 'Your City',
            to: 'Denpasar, Bali',
            departureTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
            arrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            cost: 800,
            notes: 'International flight to Bali'
          }
        ],
        packingList: [
          {
            category: 'Clothing',
            items: ['Light cotton shirts', 'Shorts and pants', 'Swimwear', 'Sarong for temples', 'Light jacket for mountains']
          },
          {
            category: 'Electronics',
            items: ['Camera', 'Phone charger', 'Power bank', 'Universal adapter']
          },
          {
            category: 'Toiletries',
            items: ['Sunscreen SPF 50+', 'Insect repellent', 'Basic toiletries', 'First aid kit']
          }
        ],
        tips: [
          'Respect local customs and dress modestly when visiting temples',
          'Carry cash as many places don\'t accept cards',
          'Learn basic Indonesian phrases',
          'Stay hydrated in the tropical climate',
          'Be prepared for early morning activities'
        ],
        isPublic: true,
        createdBy: users[0]._id
      },
      {
        title: 'Paris in 5 Days: Art, Culture & Romance',
        description: 'A perfect 5-day Paris itinerary covering iconic landmarks, world-class museums, and romantic experiences in the City of Light.',
        destination: destinations.find(d => d.name === 'Paris, France')._id,
        duration: { days: 5 },
        budget: { type: 'Luxury' },
        travelStyle: 'Cultural',
        groupSize: 'Couple',
        days: [
          {
            dayNumber: 1,
            activities: [
              {
                time: '10:00 AM',
                activity: {
                  name: 'Eiffel Tower Visit',
                  description: 'Visit the iconic Eiffel Tower and enjoy panoramic views',
                  type: 'Sightseeing',
                  location: '7th arrondissement',
                  duration: '3 hours',
                  cost: 30,
                  notes: 'Book tickets in advance to avoid queues'
                }
              },
              {
                time: '2:00 PM',
                activity: {
                  name: 'Seine River Cruise',
                  description: 'Lunch cruise along the Seine with views of major landmarks',
                  type: 'Cultural',
                  location: 'Various departure points',
                  duration: '2 hours',
                  cost: 80,
                  notes: 'Romantic lunch experience'
                }
              }
            ],
            notes: 'First day - iconic Paris landmarks'
          }
        ],
        accommodations: [
          {
            name: 'The Ritz Paris',
            type: 'Hotel',
            checkIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: '1st arrondissement',
            cost: 800,
            notes: 'Legendary luxury hotel'
          }
        ],
        transportation: [
          {
            type: 'Flight',
            from: 'Your City',
            to: 'Paris, France',
            departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            arrivalTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
            cost: 1200,
            notes: 'International flight to Paris'
          }
        ],
        packingList: [
          {
            category: 'Clothing',
            items: ['Elegant dresses', 'Blazers', 'Comfortable walking shoes', 'Scarf for style', 'Evening wear']
          },
          {
            category: 'Electronics',
            items: ['Camera', 'Phone charger', 'European adapter', 'Portable WiFi']
          }
        ],
        tips: [
          'Learn basic French phrases',
          'Purchase Paris Museum Pass for discounts',
          'Use the metro system for transportation',
          'Make restaurant reservations in advance',
          'Be aware of pickpockets in tourist areas'
        ],
        isPublic: true,
        createdBy: users[0]._id
      },
      {
        title: 'Tokyo Tech & Tradition: 10 Days',
        description: 'Explore the fascinating blend of traditional Japanese culture and cutting-edge technology in this comprehensive Tokyo itinerary.',
        destination: destinations.find(d => d.name === 'Tokyo, Japan')._id,
        duration: { days: 10 },
        budget: { type: 'Mid-range' },
        travelStyle: 'Mixed',
        groupSize: 'Solo',
        days: [
          {
            dayNumber: 1,
            activities: [
              {
                time: '9:00 AM',
                activity: {
                  name: 'Senso-ji Temple',
                  description: 'Visit Tokyo\'s oldest temple and explore traditional architecture',
                  type: 'Cultural',
                  location: 'Asakusa',
                  duration: '3 hours',
                  cost: 0,
                  notes: 'Free to visit, try traditional snacks'
                }
              }
            ],
            notes: 'Traditional Tokyo exploration'
          }
        ],
        accommodations: [
          {
            name: 'Shibuya Sky Hotel',
            type: 'Hotel',
            checkIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            checkOut: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
            location: 'Shibuya',
            cost: 150,
            notes: 'Modern hotel in the heart of Shibuya'
          }
        ],
        transportation: [
          {
            type: 'Flight',
            from: 'Your City',
            to: 'Tokyo, Japan',
            departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            arrivalTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
            cost: 1000,
            notes: 'International flight to Tokyo'
          }
        ],
        packingList: [
          {
            category: 'Clothing',
            items: ['Comfortable walking shoes', 'Layers for weather changes', 'Modest clothing for temples', 'Business casual for restaurants']
          },
          {
            category: 'Electronics',
            items: ['Phone with translation app', 'Portable WiFi or SIM card', 'Camera', 'Power bank']
          }
        ],
        tips: [
          'Learn basic Japanese phrases and bowing etiquette',
          'Carry cash as many places don\'t accept foreign cards',
          'Use JR Pass for train travel',
          'Try local convenience stores (konbini)',
          'Be respectful in temples and remove shoes when required'
        ],
        isPublic: true,
        createdBy: users[0]._id
      }
    ];

    const createdItineraries = await Itinerary.insertMany(itineraries);
    console.log(`🗺️  Created ${createdItineraries.length} itineraries`);

    console.log('✅ Itineraries seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Itineraries: ${createdItineraries.length}`);
    console.log('\n🌐 You can now browse and create trip itineraries!');

  } catch (error) {
    console.error('❌ Error seeding itineraries:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedItineraries();
