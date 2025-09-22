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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  MoreVert,
  Edit,
  Delete,
  Share,
  Favorite,
  FavoriteBorder,
  AccessTime,
  People,
  AttachMoney,
  DirectionsRun,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { itineraryAPI, favoriteAPI } from '../services/api';

const Itineraries = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [itineraries, setItineraries] = useState([]);
  const [myItineraries, setMyItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [budget, setBudget] = useState(searchParams.get('budget') || '');
  const [travelStyle, setTravelStyle] = useState(searchParams.get('travelStyle') || '');
  const [duration, setDuration] = useState(searchParams.get('duration') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  
  const [destinations, setDestinations] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  useEffect(() => {
    fetchItineraries();
    fetchDestinations();
  }, [searchQuery, destination, budget, travelStyle, duration, sortBy, sortOrder, pagination.currentPage, activeTab]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (destination) params.set('destination', destination);
    if (budget) params.set('budget', budget);
    if (travelStyle) params.set('travelStyle', travelStyle);
    if (duration) params.set('duration', duration);
    if (sortBy !== 'rating') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (pagination.currentPage > 1) params.set('page', pagination.currentPage);
    
    setSearchParams(params);
  }, [searchQuery, destination, budget, travelStyle, duration, sortBy, sortOrder, pagination.currentPage, setSearchParams]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sortBy,
        sortOrder
      };
      
      if (searchQuery) params.q = searchQuery;
      if (destination) params.destination = destination;
      if (budget) params.budget = budget;
      if (travelStyle) params.travelStyle = travelStyle;
      if (duration) params.duration = duration;

      let response;
      if (activeTab === 0) {
        response = await itineraryAPI.getItineraries(params);
        setItineraries(response.data.data.itineraries);
        setPagination(response.data.data.pagination);
      } else {
        response = await itineraryAPI.getMyItineraries(params);
        setMyItineraries(response.data.data.itineraries);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      setError('Error fetching itineraries');
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await itineraryAPI.getDestinations();
      setDestinations(response.data.data.destinations);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case 'destination':
        setDestination(value);
        break;
      case 'budget':
        setBudget(value);
        break;
      case 'travelStyle':
        setTravelStyle(value);
        break;
      case 'duration':
        setDuration(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      case 'sortOrder':
        setSortOrder(value);
        break;
      default:
        break;
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDestination('');
    setBudget('');
    setTravelStyle('');
    setDuration('');
    setSortBy('rating');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleMenuOpen = (event, itinerary) => {
    setAnchorEl(event.currentTarget);
    setSelectedItinerary(itinerary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItinerary(null);
  };

  const handleEdit = () => {
    navigate(`/itineraries/${selectedItinerary._id}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await itineraryAPI.deleteItinerary(selectedItinerary._id);
      fetchItineraries();
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      await itineraryAPI.duplicateItinerary(selectedItinerary._id);
      fetchItineraries();
      handleMenuClose();
    } catch (error) {
      console.error('Error duplicating itinerary:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedItinerary.title,
        text: selectedItinerary.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    handleMenuClose();
  };

  const handleToggleFavorite = async (itinerary) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await favoriteAPI.toggleFavorite({
        type: 'itinerary',
        itinerary: itinerary._id
      });
      fetchItineraries();
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const currentItineraries = activeTab === 0 ? itineraries : myItineraries;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" component="h1">
          Trip Itineraries
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/itineraries/create')}
          >
            Create Itinerary
          </Button>
        )}
      </Box>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Discover amazing trip itineraries or create your own personalized travel plan
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Browse Itineraries" />
          {isAuthenticated && <Tab label="My Itineraries" />}
        </Tabs>
      </Paper>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search itineraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Destination</InputLabel>
              <Select
                value={destination}
                label="Destination"
                onChange={(e) => handleFilterChange('destination', e.target.value)}
              >
                <MenuItem value="">All Destinations</MenuItem>
                {destinations.map((dest) => (
                  <MenuItem key={dest._id} value={dest._id}>
                    {dest.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Budget</InputLabel>
              <Select
                value={budget}
                label="Budget"
                onChange={(e) => handleFilterChange('budget', e.target.value)}
              >
                <MenuItem value="">All Budgets</MenuItem>
                <MenuItem value="Budget">Budget</MenuItem>
                <MenuItem value="Mid-range">Mid-range</MenuItem>
                <MenuItem value="Luxury">Luxury</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Travel Style</InputLabel>
              <Select
                value={travelStyle}
                label="Travel Style"
                onChange={(e) => handleFilterChange('travelStyle', e.target.value)}
              >
                <MenuItem value="">All Styles</MenuItem>
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

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                value={duration}
                label="Duration"
                onChange={(e) => handleFilterChange('duration', e.target.value)}
              >
                <MenuItem value="">Any Duration</MenuItem>
                <MenuItem value="1">1-3 days</MenuItem>
                <MenuItem value="4">4-7 days</MenuItem>
                <MenuItem value="8">8-14 days</MenuItem>
                <MenuItem value="15">15+ days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="createdAt">Newest</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                label="Order"
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Results */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : currentItineraries.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          {activeTab === 0 
            ? 'No itineraries found matching your criteria. Try adjusting your filters.'
            : 'You haven\'t created any itineraries yet. Create your first one!'
          }
        </Alert>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {pagination.totalItems} itinerary{pagination.totalItems !== 1 ? 's' : ''} found
          </Typography>

          <Grid container spacing={4}>
            {currentItineraries.map((itinerary) => (
              <Grid item xs={12} sm={6} md={4} key={itinerary._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                  onClick={() => navigate(`/itineraries/${itinerary._id}`)}
                >
                  {itinerary.destination?.images && itinerary.destination.images.length > 0 && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={itinerary.destination.images.find(img => img.isPrimary)?.url || itinerary.destination.images[0].url}
                      alt={itinerary.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {itinerary.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {itinerary.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        label={itinerary.destination?.name || 'Unknown Destination'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={itinerary.budget.type}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={itinerary.travelStyle}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.duration.days} days
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <People fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.groupSize}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        by {itinerary.createdBy.firstName} {itinerary.createdBy.lastName}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/itineraries/${itinerary._id}`);
                      }}
                    >
                      View Details
                    </Button>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(itinerary);
                        }}
                        color="error"
                      >
                        <FavoriteBorder />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, itinerary);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Itineraries;
