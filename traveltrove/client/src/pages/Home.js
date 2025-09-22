import React, { useEffect, useState } from 'react';
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
  Avatar,
  Paper,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Groups,
  Explore,
  Share,
  TrendingUp,
  LocationOn,
  People,
  Search,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import { destinationAPI } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { communities, fetchCommunities } = useCommunity();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    // Fetch featured communities
    fetchCommunities({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' });
  }, [fetchCommunities]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const response = await destinationAPI.searchDestinations({
        q: searchQuery,
        limit: 6
      });
      setSearchResults(response.data.data.destinations);
    } catch (error) {
      setSearchError('No destinations found matching your search. Please try different keywords.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const features = [
    {
      icon: <Groups sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Join Communities',
      description: 'Connect with like-minded travelers and share your experiences.',
    },
    {
      icon: <Explore sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Discover Destinations',
      description: 'Find amazing places to visit through community recommendations.',
    },
    {
      icon: <Share sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Share Experiences',
      description: 'Document your travels and inspire others to explore the world.',
    },
  ];

  const stats = [
    { label: 'Active Communities', value: '500+', icon: <Groups /> },
    { label: 'Travelers', value: '10K+', icon: <People /> },
    { label: 'Destinations', value: '150+', icon: <LocationOn /> },
    { label: 'Success Stories', value: '5K+', icon: <TrendingUp /> },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to TravelTrove
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Connect with fellow travelers, discover amazing destinations, and share your adventures
            with the world's most passionate travel community.
          </Typography>
          
          {/* Search Section */}
          <Box component="form" onSubmit={handleSearch} sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for destinations (e.g., 'beach destinations', 'Paris', 'mountains')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSearching || !searchQuery.trim()}
                      sx={{
                        backgroundColor: 'white',
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'grey.100' },
                        minWidth: 100
                      }}
                    >
                      {isSearching ? <CircularProgress size={20} /> : 'Search'}
                    </Button>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.7)',
                      opacity: 1,
                    },
                  },
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/communities')}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': { backgroundColor: 'grey.100' },
              }}
            >
              Explore Communities
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Join Now
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Search Results Section */}
      {(searchResults.length > 0 || searchError) && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Search Results
          </Typography>
          
          {searchError && (
            <Alert severity="info" sx={{ mb: 4 }}>
              {searchError}
            </Alert>
          )}
          
          {searchResults.length > 0 && (
            <>
              <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
                Found {searchResults.length} destination{searchResults.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </Typography>
              <Grid container spacing={4}>
                {searchResults.map((destination) => (
                  <Grid item xs={12} sm={6} md={4} key={destination._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' },
                      }}
                      onClick={() => navigate(`/destinations/${destination._id}`)}
                    >
                      {destination.images && destination.images.length > 0 && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={destination.images.find(img => img.isPrimary)?.url || destination.images[0].url}
                          alt={destination.name}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {destination.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {destination.summary}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          <Chip
                            label={destination.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            icon={<LocationOn />}
                            label={`${destination.location.city}, ${destination.location.country}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {destination.averageRating.toFixed(1)} ({destination.reviewCount} reviews)
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/destinations/${destination._id}`);
                          }}
                        >
                          View Guide
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box textAlign="center" sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(`/destinations?q=${encodeURIComponent(searchQuery)}`)}
                >
                  View All Results
                </Button>
              </Box>
            </>
          )}
        </Container>
      )}

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose TravelTrove?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to connect with the travel community
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box textAlign="center">
                  <Box sx={{ color: 'primary.main', mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h4" component="div" fontWeight="bold" color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Communities */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Featured Communities
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Join these amazing travel communities
        </Typography>
        <Grid container spacing={4}>
          {communities.slice(0, 6).map((community) => (
            <Grid item xs={12} sm={6} md={4} key={community._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
                onClick={() => navigate(`/communities/${community._id}`)}
              >
                {community.coverImage && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={community.coverImage}
                    alt={community.name}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {community.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {community.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={community.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {community.location?.country && (
                      <Chip
                        icon={<LocationOn />}
                        label={community.location.country}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {community.members?.length || 0} members
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/communities/${community._id}`);
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/communities')}
          >
            View All Communities
          </Button>
        </Box>
      </Container>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 6,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Start Your Travel Journey?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of travelers sharing their adventures and discovering new destinations.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': { backgroundColor: 'grey.100' },
              }}
            >
              Get Started Today
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Home;
