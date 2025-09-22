const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection
async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connected successfully');
    
    // Test if we can access the collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('✅ Database connection test completed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Make sure MongoDB is running and the connection string is correct');
    process.exit(1);
  }
}

// Test if required environment variables are set
function testEnvironment() {
  console.log('🔧 Testing environment configuration...');
  
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('💡 Please check your .env file');
    return false;
  }
  
  console.log('✅ Environment configuration is valid');
  return true;
}

async function main() {
  console.log('🧪 TravelTrove Application Test\n');
  
  if (!testEnvironment()) {
    process.exit(1);
  }
  
  await testConnection();
  
  console.log('\n🎉 All tests passed! The application is ready to run.');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run seed (to populate database)');
  console.log('2. Run: npm run dev:full (to start the application)');
  console.log('3. Open: http://localhost:3000');
}

main().catch(console.error);
