import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  People,
  Email,
  AdminPanelSettings,
  Person,
  Send,
  Close,
  Edit,
  Delete,
  GroupAdd,
  ExitToApp,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import CommunityChat from '../components/CommunityChat';
import { invitationAPI } from '../services/api';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentCommunity, loading, error, fetchCommunity, joinCommunity, leaveCommunity } = useCommunity();
  
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    inviteeEmail: '',
    message: '',
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCommunity(id);
    }
  }, [id, fetchCommunity]);

  const isMember = () => {
    if (!currentCommunity || !user) return false;
    return currentCommunity.members.some(member => member.user._id === user.id);
  };

  const isAdmin = () => {
    if (!currentCommunity || !user) return false;
    const member = currentCommunity.members.find(member => member.user._id === user.id);
    return member && member.role === 'admin';
  };

  const isModerator = () => {
    if (!currentCommunity || !user) return false;
    const member = currentCommunity.members.find(member => member.user._id === user.id);
    return member && ['admin', 'moderator'].includes(member.role);
  };

  const handleJoin = async () => {
    setActionLoading(true);
    const result = await joinCommunity(id);
    setActionLoading(false);
    
    if (result.success) {
      // Refresh community data
      fetchCommunity(id);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    const result = await leaveCommunity(id);
    setActionLoading(false);
    
    if (result.success) {
      // Refresh community data
      fetchCommunity(id);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteData.inviteeEmail.trim()) {
      setInviteError('Email is required');
      return;
    }

    setInviteLoading(true);
    setInviteError('');

    try {
      const result = await invitationAPI.sendInvitation({
        communityId: id,
        inviteeEmail: inviteData.inviteeEmail,
        message: inviteData.message,
      });

      if (result.data.success) {
        setInviteDialogOpen(false);
        setInviteData({ inviteeEmail: '', message: '' });
        // Show success message
      }
    } catch (error) {
      setInviteError(error.response?.data?.message || 'Failed to send invitation');
    }

    setInviteLoading(false);
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!currentCommunity) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Community not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Card sx={{ mb: 4 }}>
        {currentCommunity.coverImage && (
          <CardMedia
            component="img"
            height="300"
            image={currentCommunity.coverImage}
            alt={currentCommunity.name}
          />
        )}
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom>
                {currentCommunity.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={currentCommunity.category}
                  color="primary"
                  variant="outlined"
                />
                {currentCommunity.location?.country && (
                  <Chip
                    icon={<LocationOn />}
                    label={`${currentCommunity.location.city ? currentCommunity.location.city + ', ' : ''}${currentCommunity.location.country}`}
                    variant="outlined"
                  />
                )}
                <Chip
                  icon={<People />}
                  label={`${currentCommunity.members?.length || 0} members`}
                  variant="outlined"
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isAuthenticated && isMember() && isModerator() && (
                <Tooltip title="Send Invitation">
                  <IconButton
                    color="primary"
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    <Email />
                  </IconButton>
                </Tooltip>
              )}
              {isAuthenticated && isMember() && isAdmin() && (
                <>
                  <Tooltip title="Edit Community">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/communities/${id}/edit`)}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Community">
                    <IconButton color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph>
            {currentCommunity.description}
          </Typography>

          {isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {!isMember() ? (
                <Button
                  variant="contained"
                  startIcon={<GroupAdd />}
                  onClick={handleJoin}
                  disabled={actionLoading}
                >
                  {actionLoading ? <CircularProgress size={20} /> : 'Join Community'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ExitToApp />}
                  onClick={handleLeave}
                  disabled={actionLoading || isAdmin()}
                >
                  {actionLoading ? <CircularProgress size={20} /> : 'Leave Community'}
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Community Rules */}
          {currentCommunity.rules && currentCommunity.rules.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Community Rules
                </Typography>
                <List>
                  {currentCommunity.rules.map((rule, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={rule} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {currentCommunity.tags && currentCommunity.tags.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {currentCommunity.tags.map((tag, index) => (
                    <Chip key={index} label={tag} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Community Chat */}
          <Card>
            <CardContent>
              <CommunityChat 
                communityId={currentCommunity._id} 
                isMember={isMember()} 
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Creator Info */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Community Creator
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={currentCommunity.creator?.profilePicture}
                  alt={currentCommunity.creator?.firstName}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {currentCommunity.creator?.firstName} {currentCommunity.creator?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{currentCommunity.creator?.username}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Members ({currentCommunity.members?.length || 0})
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {currentCommunity.members?.slice(0, 10).map((member, index) => (
                  <React.Fragment key={member.user._id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={member.user.profilePicture}
                          alt={member.user.firstName}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${member.user.firstName} ${member.user.lastName}`}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption">
                              @{member.user.username}
                            </Typography>
                            {member.role === 'admin' && (
                              <Chip
                                icon={<AdminPanelSettings />}
                                label="Admin"
                                size="small"
                                color="primary"
                              />
                            )}
                            {member.role === 'moderator' && (
                              <Chip
                                icon={<Person />}
                                label="Moderator"
                                size="small"
                                color="secondary"
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < currentCommunity.members.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {currentCommunity.members?.length > 10 && (
                  <ListItem>
                    <ListItemText
                      primary={`+${currentCommunity.members.length - 10} more members`}
                      primaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invitation Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Invitation
          <IconButton
            onClick={() => setInviteDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {inviteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {inviteError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteData.inviteeEmail}
            onChange={(e) => setInviteData(prev => ({ ...prev, inviteeEmail: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Personal Message (Optional)"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={inviteData.message}
            onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Add a personal message to your invitation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvitation}
            variant="contained"
            startIcon={<Send />}
            disabled={inviteLoading}
          >
            {inviteLoading ? <CircularProgress size={20} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommunityDetail;
