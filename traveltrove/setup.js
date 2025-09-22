const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from env.example');
    console.log('📝 Please update the .env file with your actual values');
  } else {
    const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/traveltrove
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
NODE_ENV=development
CLIENT_URL=http://localhost:3000`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with default values');
    console.log('📝 Please update the .env file with your actual values');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🚀 Setup complete! Next steps:');
console.log('1. Update .env file with your MongoDB URI and email credentials');
console.log('2. Make sure MongoDB is running');
console.log('3. Run: npm run seed (to populate database with sample data)');
console.log('4. Run: npm run dev:full (to start both backend and frontend)');
console.log('\n📖 Check README.md for detailed instructions');
