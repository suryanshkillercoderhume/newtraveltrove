import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Rating,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  AccessTime,
  People,
  AttachMoney,
  Share,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { favoriteAPI, destinationAPI, itineraryAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteAPI.getFavorites();
      setFavorites(response.data.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await favoriteAPI.removeFavorite(favoriteId);
      setFavorites(favorites.filter(fav => fav._id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const destinationFavorites = favorites.filter(fav => fav.type === 'destination');
  const itineraryFavorites = favorites.filter(fav => fav.type === 'itinerary');

  const DestinationCard = ({ favorite }) => {
    const destination = favorite.destination || favorite.itinerary;
    
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={destination.images?.[0] || '/api/placeholder/400/200'}
          alt={destination.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {destination.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {destination.description?.substring(0, 100)}...
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {destination.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip 
              label={destination.category} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
          {destination.averageRating && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating 
                value={destination.averageRating} 
                readOnly 
                size="small"
                precision={0.1}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({destination.reviewCount} reviews)
              </Typography>
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => navigate(`/destinations/${destination._id}`)}
          >
            View Details
          </Button>
          <IconButton
            size="small"
            onClick={() => handleRemoveFavorite(favorite._id)}
            color="error"
          >
            <Favorite />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  const ItineraryCard = ({ favorite }) => {
    const itinerary = favorite.itinerary || favorite.destination;
    
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={itinerary.images?.[0] || '/api/placeholder/400/200'}
          alt={itinerary.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {itinerary.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {itinerary.description?.substring(0, 100)}...
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {itinerary.destination}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {itinerary.duration} days
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <People sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {itinerary.groupSize}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip 
              label={itinerary.travelStyle} 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
            {itinerary.budget && (
              <Chip 
                label={`$${itinerary.budget}`} 
                size="small" 
                color="success" 
                variant="outlined"
                icon={<AttachMoney />}
              />
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => navigate(`/itineraries/${itinerary._id}`)}
          >
            View Details
          </Button>
          <IconButton
            size="small"
            onClick={() => handleRemoveFavorite(favorite._id)}
            color="error"
          >
            <Favorite />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          Please log in to view your favorites.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading your favorites...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Favorites
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your saved destinations and itineraries
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={`Destinations (${destinationFavorites.length})`} 
            icon={<LocationOn />}
          />
          <Tab 
            label={`Itineraries (${itineraryFavorites.length})`} 
            icon={<AccessTime />}
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {destinationFavorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No favorite destinations yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Start exploring destinations and add them to your favorites!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/destinations')}
            >
              Browse Destinations
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {destinationFavorites.map((favorite) => (
              <Grid item xs={12} sm={6} md={4} key={favorite._id}>
                <DestinationCard favorite={favorite} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {itineraryFavorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AccessTime sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No favorite itineraries yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Discover amazing itineraries and save them to your favorites!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/itineraries')}
            >
              Browse Itineraries
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {itineraryFavorites.map((favorite) => (
              <Grid item xs={12} sm={6} md={4} key={favorite._id}>
                <ItineraryCard favorite={favorite} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </Container>
  );
};

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`favorites-tabpanel-${index}`}
    aria-labelledby={`favorites-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export default Favorites;
