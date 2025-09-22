import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Edit,
  LocationOn,
  People,
  Email,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { communities, fetchCommunities } = useCommunity();
  const [tabValue, setTabValue] = useState(0);
  const [userCommunities, setUserCommunities] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user?.communities) {
      // Filter communities that the user is a member of
      const filteredCommunities = communities.filter(community =>
        user.communities.includes(community._id)
      );
      setUserCommunities(filteredCommunities);
    }
  }, [user, communities, isAuthenticated]);

  useEffect(() => {
    // Fetch all communities to get updated data
    fetchCommunities({ limit: 100 });
  }, [fetchCommunities]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar
              src={user?.profilePicture}
              alt={`${user?.firstName} ${user?.lastName}`}
              sx={{ width: 120, height: 120 }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              @{user?.username}
            </Typography>
            {user?.bio && (
              <Typography variant="body1" paragraph>
                {user.bio}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<Email />}
                label={user?.email}
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<People />}
                label={`${userCommunities.length} communities`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => {
                // TODO: Implement edit profile functionality
                console.log('Edit profile clicked');
              }}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="My Communities" />
          <Tab label="Activity" />
          <Tab label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            My Communities
          </Typography>
          {userCommunities.length === 0 ? (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You haven't joined any communities yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Explore and join communities to connect with fellow travelers
              </Typography>
              <Button variant="contained" href="/communities">
                Browse Communities
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {userCommunities.map((community) => (
                <Grid item xs={12} sm={6} md={4} key={community._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                    onClick={() => window.location.href = `/communities/${community._id}`}
                  >
                    {community.coverImage && (
                      <Box
                        component="img"
                        src={community.coverImage}
                        alt={community.name}
                        sx={{
                          height: 200,
                          width: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {community.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
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
                      <Button size="small" href={`/communities/${community._id}`}>
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Recent Activity
          </Typography>
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No recent activity
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your recent activities will appear here
            </Typography>
          </Paper>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Account Settings
          </Typography>
          <Paper elevation={1} sx={{ p: 4 }}>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Personal Information"
                  secondary="Update your name, bio, and profile picture"
                />
                <Button variant="outlined" size="small">
                  Edit
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <Email />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Email & Password"
                  secondary="Change your email address and password"
                />
                <Button variant="outlined" size="small">
                  Edit
                </Button>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <People />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Privacy Settings"
                  secondary="Manage your privacy and notification preferences"
                />
                <Button variant="outlined" size="small">
                  Edit
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default Profile;
