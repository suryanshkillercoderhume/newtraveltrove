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
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  People,
  AttachMoney,
  DirectionsRun,
  Share,
  Favorite,
  FavoriteBorder,
  Edit,
  Delete,
  Add,
  Hotel,
  Restaurant,
  Attractions,
  DirectionsCar,
  Flight,
  Train,
  DirectionsBus,
  Walking,
  DirectionsBoat,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itineraryAPI, reviewAPI, favoriteAPI } from '../services/api';

const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [itinerary, setItinerary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    pros: [],
    cons: [],
    visitDate: '',
    travelStyle: '',
    groupSize: ''
  });

  useEffect(() => {
    fetchItinerary();
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [id, isAuthenticated]);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const response = await itineraryAPI.getItinerary(id);
      setItinerary(response.data.data.itinerary);
      setReviews(response.data.data.recentReviews || []);
    } catch (error) {
      setError('Itinerary not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteAPI.checkFavorite({ itinerary: id });
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
        type: 'itinerary',
        itinerary: id
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
        title: itinerary.title,
        text: itinerary.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleEdit = () => {
    navigate(`/itineraries/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        await itineraryAPI.deleteItinerary(id);
        navigate('/itineraries');
      } catch (error) {
        console.error('Error deleting itinerary:', error);
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      await itineraryAPI.duplicateItinerary(id);
      navigate('/itineraries');
    } catch (error) {
      console.error('Error duplicating itinerary:', error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await reviewAPI.createReview({
        ...newReview,
        itinerary: id
      });
      setReviewDialogOpen(false);
      fetchItinerary();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getTransportIcon = (type) => {
    switch (type) {
      case 'Flight': return <Flight />;
      case 'Train': return <Train />;
      case 'Bus': return <DirectionsBus />;
      case 'Car': return <DirectionsCar />;
      case 'Walking': return <Walking />;
      case 'Boat': return <DirectionsBoat />;
      default: return <DirectionsCar />;
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

  if (error || !itinerary) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const isOwner = isAuthenticated && user && itinerary.createdBy._id === user.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 4 }}>
        {itinerary.destination?.images && itinerary.destination.images.length > 0 && (
          <CardMedia
            component="img"
            height="400"
            image={itinerary.destination.images.find(img => img.isPrimary)?.url || itinerary.destination.images[0].url}
            alt={itinerary.title}
            sx={{ borderRadius: 2, mb: 3 }}
          />
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {itinerary.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {itinerary.destination?.name || 'Unknown Destination'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color="action" />
                <Typography variant="body1">
                  {itinerary.duration.days} days
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People color="action" />
                <Typography variant="body1">
                  {itinerary.groupSize}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney color="action" />
                <Typography variant="body1">
                  {itinerary.budget.type}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={itinerary.travelStyle} color="primary" />
              <Chip label={itinerary.budget.type} variant="outlined" />
              {itinerary.destination?.category && (
                <Chip label={itinerary.destination.category} variant="outlined" />
              )}
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
            {isOwner && (
              <>
                <IconButton onClick={handleEdit}>
                  <Edit />
                </IconButton>
                <IconButton onClick={handleDelete} color="error">
                  <Delete />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {itinerary.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleDuplicate}
            startIcon={<Add />}
          >
            Duplicate Itinerary
          </Button>
          {isAuthenticated && (
            <Button
              variant="outlined"
              onClick={() => setReviewDialogOpen(true)}
            >
              Write a Review
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs Section */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Daily Schedule" />
          <Tab label="Accommodations" />
          <Tab label="Transportation" />
          <Tab label="Packing List" />
          <Tab label="Reviews" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {itinerary.days && itinerary.days.length > 0 ? (
              itinerary.days.map((day) => (
                <Grid item xs={12} key={day.dayNumber}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Day {day.dayNumber}
                      </Typography>
                      
                      {day.activities && day.activities.length > 0 ? (
                        <List>
                          {day.activities.map((activity, index) => (
                            <React.Fragment key={index}>
                              <ListItem>
                                <ListItemText
                                  primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography variant="subtitle1" fontWeight="bold">
                                        {activity.time}
                                      </Typography>
                                      <Typography variant="subtitle1">
                                        {activity.activity.name}
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" paragraph>
                                        {activity.activity.description}
                                      </Typography>
                                      <Box display="flex" gap={1} flexWrap="wrap">
                                        <Chip label={activity.activity.type} size="small" />
                                        {activity.activity.location && (
                                          <Chip label={activity.activity.location} size="small" variant="outlined" />
                                        )}
                                        {activity.activity.duration && (
                                          <Chip 
                                            icon={<AccessTime />} 
                                            label={activity.activity.duration} 
                                            size="small" 
                                            variant="outlined" 
                                          />
                                        )}
                                        {activity.activity.cost && (
                                          <Chip 
                                            icon={<AttachMoney />} 
                                            label={`$${activity.activity.cost}`} 
                                            size="small" 
                                            variant="outlined" 
                                          />
                                        )}
                                      </Box>
                                      {activity.activity.notes && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                          <strong>Notes:</strong> {activity.activity.notes}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItem>
                              {index < day.activities.length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Typography color="text.secondary">
                          No activities planned for this day
                        </Typography>
                      )}
                      
                      {day.notes && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Notes:</strong> {day.notes}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No daily schedule available.
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {itinerary.accommodations && itinerary.accommodations.length > 0 ? (
              itinerary.accommodations.map((acc, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Hotel color="action" />
                        <Typography variant="h6">
                          {acc.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={acc.type} size="small" />
                        <Chip label={acc.priceRange} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {acc.description}
                      </Typography>
                      {acc.location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {acc.location}
                        </Typography>
                      )}
                      {acc.checkIn && acc.checkOut && (
                        <Typography variant="body2" color="text.secondary">
                          📅 {new Date(acc.checkIn).toLocaleDateString()} - {new Date(acc.checkOut).toLocaleDateString()}
                        </Typography>
                      )}
                      {acc.cost && (
                        <Typography variant="body2" color="text.secondary">
                          💰 ${acc.cost}
                        </Typography>
                      )}
                      {acc.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <strong>Notes:</strong> {acc.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No accommodations information available.
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            {itinerary.transportation && itinerary.transportation.length > 0 ? (
              itinerary.transportation.map((trans, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {getTransportIcon(trans.type)}
                        <Typography variant="h6">
                          {trans.type}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {trans.from} → {trans.to}
                      </Typography>
                      {trans.departureTime && (
                        <Typography variant="body2" color="text.secondary">
                          🕐 Departure: {new Date(trans.departureTime).toLocaleString()}
                        </Typography>
                      )}
                      {trans.arrivalTime && (
                        <Typography variant="body2" color="text.secondary">
                          🕐 Arrival: {new Date(trans.arrivalTime).toLocaleString()}
                        </Typography>
                      )}
                      {trans.cost && (
                        <Typography variant="body2" color="text.secondary">
                          💰 ${trans.cost}
                        </Typography>
                      )}
                      {trans.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <strong>Notes:</strong> {trans.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No transportation information available.
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            {itinerary.packingList && itinerary.packingList.length > 0 ? (
              itinerary.packingList.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {category.category}
                      </Typography>
                      <List dense>
                        {category.items.map((item, itemIndex) => (
                          <ListItem key={itemIndex}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No packing list available.
                </Typography>
              </Grid>
            )}
          </Grid>
          
          {itinerary.tips && itinerary.tips.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Travel Tips
              </Typography>
              <List>
                {itinerary.tips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Reviews ({itinerary.reviewCount || 0})
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
              No reviews yet. Be the first to review this itinerary!
            </Typography>
          )}
        </TabPanel>
      </Paper>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={newReview.rating}
                onChange={(e, value) => setNewReview(prev => ({ ...prev, rating: value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Review Title"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Review Content"
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Travel Style</InputLabel>
                <Select
                  value={newReview.travelStyle}
                  label="Travel Style"
                  onChange={(e) => setNewReview(prev => ({ ...prev, travelStyle: e.target.value }))}
                >
                  <MenuItem value="Adventure">Adventure</MenuItem>
                  <MenuItem value="Relaxation">Relaxation</MenuItem>
                  <MenuItem value="Cultural">Cultural</MenuItem>
                  <MenuItem value="Food">Food</MenuItem>
                  <MenuItem value="Nature">Nature</MenuItem>
                  <MenuItem value="City">City</MenuItem>
                  <MenuItem value="Beach">Beach</MenuItem>
                  <MenuItem value="Mixed">Mixed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Group Size</InputLabel>
                <Select
                  value={newReview.groupSize}
                  label="Group Size"
                  onChange={(e) => setNewReview(prev => ({ ...prev, groupSize: e.target.value }))}
                >
                  <MenuItem value="Solo">Solo</MenuItem>
                  <MenuItem value="Couple">Couple</MenuItem>
                  <MenuItem value="Small Group (2-4)">Small Group (2-4)</MenuItem>
                  <MenuItem value="Medium Group (5-8)">Medium Group (5-8)</MenuItem>
                  <MenuItem value="Large Group (9+)">Large Group (9+)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItineraryDetail;
