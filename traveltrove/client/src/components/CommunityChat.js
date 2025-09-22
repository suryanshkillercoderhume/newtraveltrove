import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
} from '@mui/material';
import {
  Send,
  MoreVert,
  Edit,
  Delete,
  Reply,
  ThumbUp,
  Favorite,
  TravelExplore,
  CalendarToday,
  Hotel,
  DirectionsRun
} from '@mui/icons-material';
import { messageAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CommunityChat = ({ communityId, isMember }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageType, setMessageType] = useState('text');
  const [travelPlan, setTravelPlan] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    accommodation: '',
    activities: [],
    notes: ''
  });
  const [showTravelPlanForm, setShowTravelPlanForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (communityId && isMember) {
      fetchMessages();
    }
  }, [communityId, isMember]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await messageAPI.getMessages(communityId);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && messageType === 'text') return;
    if (messageType === 'travel_plan' && !travelPlan.destination) return;

    setSending(true);
    try {
      const messageData = {
        content: newMessage,
        messageType,
        ...(messageType === 'travel_plan' && { travelPlan })
      };

      const response = await messageAPI.sendMessage(communityId, messageData);
      setMessages(prev => [...prev, response.data.data.message]);
      setNewMessage('');
      setTravelPlan({
        destination: '',
        startDate: '',
        endDate: '',
        budget: '',
        accommodation: '',
        activities: [],
        notes: ''
      });
      setMessageType('text');
      setShowTravelPlanForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      const response = await messageAPI.editMessage(messageId, content);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? response.data.data.message : msg
        )
      );
      setEditingMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await messageAPI.addReaction(messageId, emoji);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? response.data.data.message : msg
        )
      );
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleReply = async (messageId, content) => {
    try {
      const response = await messageAPI.addReply(messageId, content);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? response.data.data.message : msg
        )
      );
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTravelPlan = (plan) => (
    <Card sx={{ mt: 1, bgcolor: 'primary.50' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <TravelExplore sx={{ mr: 1, verticalAlign: 'middle' }} />
          Travel Plan
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Destination:</strong> {plan.destination}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Budget:</strong> ${plan.budget}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <CalendarToday sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
              <strong>Start:</strong> {formatDate(plan.startDate)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <CalendarToday sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
              <strong>End:</strong> {formatDate(plan.endDate)}
            </Typography>
          </Grid>
          {plan.accommodation && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                <Hotel sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                <strong>Accommodation:</strong> {plan.accommodation}
              </Typography>
            </Grid>
          )}
          {plan.activities && plan.activities.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                <DirectionsRun sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                <strong>Activities:</strong>
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {plan.activities.map((activity, index) => (
                  <Chip key={index} label={activity} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            </Grid>
          )}
          {plan.notes && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                <strong>Notes:</strong> {plan.notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderMessage = (message) => (
    <Box key={message._id} sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Avatar 
          src={message.sender.profilePicture} 
          alt={message.sender.username}
          sx={{ width: 32, height: 32 }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {message.sender.firstName} {message.sender.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(message.createdAt)}
            </Typography>
            {message.isEdited && (
              <Typography variant="caption" color="text.secondary">
                (edited)
              </Typography>
            )}
            {message.sender._id === user?.id && (
              <IconButton
                size="small"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setSelectedMessage(message);
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Box>
          
          <Typography variant="body2" sx={{ mb: 1 }}>
            {message.content}
          </Typography>
          
          {message.messageType === 'travel_plan' && message.travelPlan && 
            renderTravelPlan(message.travelPlan)
          }
          
          {message.reactions && message.reactions.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
              {message.reactions.map((reaction, index) => (
                <Chip
                  key={index}
                  label={`${reaction.emoji} ${reaction.user.username}`}
                  size="small"
                  variant="outlined"
                  onClick={() => handleReaction(message._id, reaction.emoji)}
                />
              ))}
            </Box>
          )}
          
          {message.replies && message.replies.length > 0 && (
            <Box sx={{ ml: 2, mt: 1 }}>
              {message.replies.map((reply, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Avatar 
                    src={reply.sender.profilePicture} 
                    alt={reply.sender.username}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2">
                    <strong>{reply.sender.username}:</strong> {reply.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Tooltip title="Like">
              <IconButton size="small" onClick={() => handleReaction(message._id, '👍')}>
                <ThumbUp fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Love">
              <IconButton size="small" onClick={() => handleReaction(message._id, '❤️')}>
                <Favorite fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reply">
              <IconButton size="small" onClick={() => setReplyingTo(message)}>
                <Reply fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  if (!isMember) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Join this community to participate in the chat
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Community Chat</Typography>
      </Box>
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading ? (
          <Typography>Loading messages...</Typography>
        ) : messages.length === 0 ? (
          <Typography color="text.secondary" textAlign="center">
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Message Type</InputLabel>
            <Select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              input={<OutlinedInput label="Message Type" />}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="travel_plan">Travel Plan</MenuItem>
            </Select>
          </FormControl>
          {messageType === 'travel_plan' && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowTravelPlanForm(true)}
            >
              Add Travel Details
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder={messageType === 'travel_plan' ? 'Share your travel plan...' : 'Type a message...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={sending || (!newMessage.trim() && messageType === 'text')}
            startIcon={<Send />}
          >
            Send
          </Button>
        </Box>
      </Box>

      {/* Travel Plan Form Dialog */}
      <Dialog open={showTravelPlanForm} onClose={() => setShowTravelPlanForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Travel Plan Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Destination"
                value={travelPlan.destination}
                onChange={(e) => setTravelPlan(prev => ({ ...prev, destination: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={travelPlan.startDate}
                onChange={(e) => setTravelPlan(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={travelPlan.endDate}
                onChange={(e) => setTravelPlan(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget"
                type="number"
                value={travelPlan.budget}
                onChange={(e) => setTravelPlan(prev => ({ ...prev, budget: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Accommodation"
                value={travelPlan.accommodation}
                onChange={(e) => setTravelPlan(prev => ({ ...prev, accommodation: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Activities (comma-separated)"
                value={travelPlan.activities.join(', ')}
                onChange={(e) => setTravelPlan(prev => ({ 
                  ...prev, 
                  activities: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                }))}
                placeholder="Hiking, Sightseeing, Food tours..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Notes"
                value={travelPlan.notes}
                onChange={(e) => setTravelPlan(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTravelPlanForm(false)}>Cancel</Button>
          <Button onClick={() => setShowTravelPlanForm(false)} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Message Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setEditingMessage(selectedMessage);
          setAnchorEl(null);
        }}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteMessage(selectedMessage._id);
          setAnchorEl(null);
        }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default CommunityChat;
