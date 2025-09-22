const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./backend/config/database');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/communities', require('./backend/routes/communities'));
app.use('/api/invitations', require('./backend/routes/invitations'));
app.use('/api/messages', require('./backend/routes/messages'));
app.use('/api/destinations', require('./backend/routes/destinations'));
app.use('/api/itineraries', require('./backend/routes/itineraries'));
app.use('/api/reviews', require('./backend/routes/reviews'));
app.use('/api/favorites', require('./backend/routes/favorites'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
