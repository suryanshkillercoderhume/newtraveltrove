import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  LocationOn,
  People,
  CheckCircle,
  Cancel,
  Person,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { invitationAPI } from '../services/api';

const InvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionResult, setActionResult] = useState('');

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await invitationAPI.getInvitation(token);
        setInvitation(response.data.data.invitation);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/invitation/${token}` } } });
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const response = await invitationAPI.acceptInvitation(token);
      setActionResult('success');
      // Redirect to community after a short delay
      setTimeout(() => {
        navigate(`/communities/${invitation.community._id}`);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/invitation/${token}` } } });
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await invitationAPI.declineInvitation(token);
      setActionResult('declined');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box textAlign="center">
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Box>
      </Container>
    );
  }

  if (!invitation) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Invitation not found
        </Alert>
      </Container>
    );
  }

  if (actionResult === 'success') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Welcome to {invitation.community.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You have successfully joined the community. Redirecting you now...
          </Typography>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  if (actionResult === 'declined') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Invitation Declined
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You have declined the invitation to join {invitation.community.name}.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            You're Invited!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {invitation.inviter.firstName} {invitation.inviter.lastName} has invited you to join a travel community
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 4 }}>
          {invitation.community.coverImage && (
            <CardMedia
              component="img"
              height="200"
              image={invitation.community.coverImage}
              alt={invitation.community.name}
            />
          )}
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              {invitation.community.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {invitation.community.description}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Chip
                  label={invitation.community.category}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
              {invitation.community.location?.country && (
                <Grid item xs={12} sm={6}>
                  <Chip
                    icon={<LocationOn />}
                    label={`${invitation.community.location.city ? invitation.community.location.city + ', ' : ''}${invitation.community.location.country}`}
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <People fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {invitation.community.members?.length || 0} members
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Inviter Info */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Invited by
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={invitation.inviter.profilePicture}
                alt={invitation.inviter.firstName}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {invitation.inviter.firstName} {invitation.inviter.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{invitation.inviter.username}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Message */}
        {invitation.message && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Message
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                "{invitation.message}"
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {!isAuthenticated ? (
            <>
              <Button
                variant="outlined"
                onClick={() => navigate('/login', { state: { from: { pathname: `/invitation/${token}` } } })}
              >
                Login to Respond
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register', { state: { from: { pathname: `/invitation/${token}` } } })}
              >
                Sign Up to Join
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={handleDecline}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={20} /> : 'Decline'}
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleAccept}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={20} /> : 'Accept Invitation'}
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            This invitation expires on {new Date(invitation.expiresAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default InvitationPage;
