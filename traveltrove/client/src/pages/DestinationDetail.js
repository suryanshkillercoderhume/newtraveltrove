import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Paper,
  Tabs,
  Tab,
  Rating,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocationOn,
  Star,
  Favorite,
  FavoriteBorder,
  Share,
  AccessTime,
  Attractions,
  Hotel,
  Restaurant,
  DirectionsRun,
  History,
  Culture,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { destinationAPI, reviewAPI, favoriteAPI } from '../services/api';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [destination, setDestination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    fetchDestination();
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [id, isAuthenticated]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      const response = await destinationAPI.getDestination(id);
      setDestination(response.data.data.destination);
      setReviews(response.data.data.recentReviews || []);
    } catch (error) {
      console.error('Error fetching destination:', error);
      setError('Destination not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteAPI.checkFavorite({ destination: id });
      setIsFavorited(response.data.data.isFavorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      const response = await favoriteAPI.toggleFavorite({
        type: 'destination',
        destination: id
      });
      setIsFavorited(response.data.data.isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination.name,
        text: destination.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !destination) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 4 }}>
        {destination.images && destination.images.length > 0 && (
          <CardMedia
            component="img"
            height="400"
            image={destination.images.find(img => img.isPrimary)?.url || destination.images[0].url}
            alt={destination.name}
            sx={{ borderRadius: 2, mb: 3 }}
          />
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {destination.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationOn color="action" />
              <Typography variant="h6" color="text.secondary">
                {destination.location.city}, {destination.location.country}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={destination.averageRating} readOnly precision={0.1} />
              <Typography variant="body1">
                {destination.averageRating.toFixed(1)} ({destination.reviewCount} reviews)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={destination.category} color="primary" />
              {destination.tags.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              color={isFavorited ? 'error' : 'default'}
            >
              {favoriteLoading ? <CircularProgress size={24} /> : 
                isFavorited ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton onClick={handleShare}>
              <Share />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {destination.summary}
        </Typography>
      </Box>

      {/* Tabs Section */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<History />} label="History & Culture" />
          <Tab icon={<Attractions />} label="Attractions" />
          <Tab icon={<Hotel />} label="Lodging" />
          <Tab icon={<Restaurant />} label="Dining" />
          <Tab icon={<DirectionsRun />} label="Activities" />
          <Tab icon={<Star />} label="Reviews" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={4}>
            {destination.history && (
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  History
                </Typography>
                <Typography variant="body1" paragraph>
                  {destination.history}
                </Typography>
              </Grid>
            )}
            {destination.culture && (
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  Culture
                </Typography>
                <Typography variant="body1" paragraph>
                  {destination.culture}
                </Typography>
              </Grid>
            )}
            {destination.bestTimeToVisit && (
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Best Time to Visit
                </Typography>
                <Typography variant="body1">
                  {destination.bestTimeToVisit}
                </Typography>
              </Grid>
            )}
            {destination.travelTips && destination.travelTips.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  Travel Tips
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {destination.travelTips.map((tip, index) => (
                    <li key={index}>
                      <Typography variant="body1">{tip}</Typography>
                    </li>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {destination.attractions && destination.attractions.length > 0 ? (
              destination.attractions.map((attraction, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    {attraction.image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={attraction.image}
                        alt={attraction.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {attraction.name}
                      </Typography>
                      <Chip label={attraction.type} size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {attraction.description}
                      </Typography>
                      {attraction.location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {attraction.location}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No attractions information available.
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            {destination.lodging && destination.lodging.length > 0 ? (
              destination.lodging.map((lodging, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    {lodging.image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={lodging.image}
                        alt={lodging.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {lodging.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={lodging.type} size="small" />
                        <Chip label={lodging.priceRange} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {lodging.description}
                      </Typography>
                      {lodging.location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {lodging.location}
                        </Typography>
                      )}
                      {lodging.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Rating value={lodging.rating} readOnly size="small" />
                          <Typography variant="body2">{lodging.rating}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No lodging recommendations available.
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            {destination.dining && destination.dining.length > 0 ? (
              destination.dining.map((restaurant, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    {restaurant.image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={restaurant.image}
                        alt={restaurant.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {restaurant.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={restaurant.cuisine} size="small" />
                        <Chip label={restaurant.priceRange} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {restaurant.description}
                      </Typography>
                      {restaurant.location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {restaurant.location}
                        </Typography>
                      )}
                      {restaurant.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Rating value={restaurant.rating} readOnly size="small" />
                          <Typography variant="body2">{restaurant.rating}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No dining recommendations available.
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            {destination.activities && destination.activities.length > 0 ? (
              destination.activities.map((activity, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    {activity.image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={activity.image}
                        alt={activity.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {activity.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip label={activity.type} size="small" />
                        <Chip label={activity.priceRange} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {activity.description}
                      </Typography>
                      {activity.duration && (
                        <Typography variant="body2" color="text.secondary">
                          ⏱️ {activity.duration}
                        </Typography>
                      )}
                      {activity.location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {activity.location}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No activities information available.
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Reviews ({destination.reviewCount})
            </Typography>
            {isAuthenticated && (
              <Button
                variant="contained"
                onClick={() => setReviewDialogOpen(true)}
              >
                Write a Review
              </Button>
            )}
          </Box>

          {reviews.length > 0 ? (
            <Grid container spacing={3}>
              {reviews.map((review) => (
                <Grid item xs={12} key={review._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar src={review.user.profilePicture} />
                        <Box>
                          <Typography variant="subtitle1">
                            {review.user.firstName} {review.user.lastName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {review.title}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {review.content}
                      </Typography>
                      {review.pros && review.pros.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="success.main">
                            Pros:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2 }}>
                            {review.pros.map((pro, index) => (
                              <li key={index}>
                                <Typography variant="body2">{pro}</Typography>
                              </li>
                            ))}
                          </Box>
                        </Box>
                      )}
                      {review.cons && review.cons.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" color="error.main">
                            Cons:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2 }}>
                            {review.cons.map((con, index) => (
                              <li key={index}>
                                <Typography variant="body2">{con}</Typography>
                              </li>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No reviews yet. Be the first to review this destination!
            </Typography>
          )}
        </TabPanel>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(`/itineraries?destination=${id}`)}
        >
          Find Itineraries
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/destinations')}
        >
          Browse More Destinations
        </Button>
      </Box>
    </Container>
  );
};

export default DestinationDetail;
