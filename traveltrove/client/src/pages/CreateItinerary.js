import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  AccessTime,
  Attractions,
  Hotel,
  Restaurant,
  DirectionsRun,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { destinationAPI, itineraryAPI } from '../services/api';

const CreateItinerary = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing itinerary
  const { isAuthenticated, user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [destinations, setDestinations] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration: { days: 1 },
    budget: { type: 'Mid-range' },
    travelStyle: 'Mixed',
    groupSize: 'Solo',
    days: [],
    accommodations: [],
    transportation: [],
    packingList: [],
    tips: []
  });

  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [newActivity, setNewActivity] = useState({
    time: '',
    activity: {
      name: '',
      description: '',
      type: 'Sightseeing',
      location: '',
      duration: '',
      cost: '',
      notes: ''
    }
  });

  const steps = [
    'Basic Information',
    'Daily Activities',
    'Accommodations',
    'Transportation',
    'Packing & Tips'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchDestinations();
    
    if (id) {
      fetchItinerary();
    }
  }, [isAuthenticated, id, navigate]);

  const fetchDestinations = async () => {
    try {
      const response = await destinationAPI.getDestinations({ limit: 100 });
      setDestinations(response.data.data.destinations);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const response = await itineraryAPI.getItinerary(id);
      const itinerary = response.data.data.itinerary;
      
      setFormData({
        title: itinerary.title,
        description: itinerary.description,
        destination: itinerary.destination._id,
        duration: itinerary.duration,
        budget: itinerary.budget,
        travelStyle: itinerary.travelStyle,
        groupSize: itinerary.groupSize,
        days: itinerary.days || [],
        accommodations: itinerary.accommodations || [],
        transportation: itinerary.transportation || [],
        packingList: itinerary.packingList || [],
        tips: itinerary.tips || []
      });
    } catch (error) {
      setError('Error loading itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= formData.duration.days; i++) {
      days.push({
        dayNumber: i,
        date: null,
        activities: [],
        notes: ''
      });
    }
    setFormData(prev => ({ ...prev, days }));
  };

  const handleAddActivity = (dayNumber) => {
    setCurrentDay(dayNumber);
    setNewActivity({
      time: '',
      activity: {
        name: '',
        description: '',
        type: 'Sightseeing',
        location: '',
        duration: '',
        cost: '',
        notes: ''
      }
    });
    setDayDialogOpen(true);
  };

  const handleSaveActivity = () => {
    if (!newActivity.time || !newActivity.activity.name) return;

    setFormData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.dayNumber === currentDay
          ? { ...day, activities: [...day.activities, newActivity] }
          : day
      )
    }));

    setDayDialogOpen(false);
  };

  const handleDeleteActivity = (dayNumber, activityIndex) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.dayNumber === dayNumber
          ? { ...day, activities: day.activities.filter((_, index) => index !== activityIndex) }
          : day
      )
    }));
  };

  const handleAddAccommodation = () => {
    setFormData(prev => ({
      ...prev,
      accommodations: [...prev.accommodations, {
        name: '',
        type: 'Hotel',
        checkIn: '',
        checkOut: '',
        location: '',
        cost: '',
        notes: ''
      }]
    }));
  };

  const handleUpdateAccommodation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations.map((acc, i) => 
        i === index ? { ...acc, [field]: value } : acc
      )
    }));
  };

  const handleDeleteAccommodation = (index) => {
    setFormData(prev => ({
      ...prev,
      accommodations: prev.accommodations.filter((_, i) => i !== index)
    }));
  };

  const handleAddTransportation = () => {
    setFormData(prev => ({
      ...prev,
      transportation: [...prev.transportation, {
        type: 'Flight',
        from: '',
        to: '',
        departureTime: '',
        arrivalTime: '',
        cost: '',
        notes: ''
      }]
    }));
  };

  const handleUpdateTransportation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      transportation: prev.transportation.map((trans, i) => 
        i === index ? { ...trans, [field]: value } : trans
      )
    }));
  };

  const handleDeleteTransportation = (index) => {
    setFormData(prev => ({
      ...prev,
      transportation: prev.transportation.filter((_, i) => i !== index)
    }));
  };

  const handleAddPackingItem = (category) => {
    setFormData(prev => ({
      ...prev,
      packingList: prev.packingList.map(item => 
        item.category === category
          ? { ...item, items: [...item.items, ''] }
          : item
      )
    }));
  };

  const handleUpdatePackingItem = (category, itemIndex, value) => {
    setFormData(prev => ({
      ...prev,
      packingList: prev.packingList.map(item => 
        item.category === category
          ? { ...item, items: item.items.map((itm, i) => i === itemIndex ? value : itm) }
          : item
      )
    }));
  };

  const handleDeletePackingItem = (category, itemIndex) => {
    setFormData(prev => ({
      ...prev,
      packingList: prev.packingList.map(item => 
        item.category === category
          ? { ...item, items: item.items.filter((_, i) => i !== itemIndex) }
          : item
      )
    }));
  };

  const handleAddTip = () => {
    setFormData(prev => ({
      ...prev,
      tips: [...prev.tips, '']
    }));
  };

  const handleUpdateTip = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips.map((tip, i) => i === index ? value : tip)
    }));
  };

  const handleDeleteTip = (index) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (activeStep === 0 && formData.duration.days > 0) {
      generateDays();
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (id) {
        await itineraryAPI.updateItinerary(id, formData);
      } else {
        await itineraryAPI.createItinerary(formData);
      }

      navigate('/itineraries');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving itinerary');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Itinerary Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Destination</InputLabel>
          <Select
            value={formData.destination}
            label="Destination"
            onChange={(e) => handleInputChange('destination', e.target.value)}
          >
            {destinations.map((dest) => (
              <MenuItem key={dest._id} value={dest._id}>
                {dest.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Duration (Days)"
          value={formData.duration.days}
          onChange={(e) => handleNestedInputChange('duration', 'days', parseInt(e.target.value))}
          inputProps={{ min: 1, max: 365 }}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Budget Type</InputLabel>
          <Select
            value={formData.budget.type}
            label="Budget Type"
            onChange={(e) => handleNestedInputChange('budget', 'type', e.target.value)}
          >
            <MenuItem value="Budget">Budget</MenuItem>
            <MenuItem value="Mid-range">Mid-range</MenuItem>
            <MenuItem value="Luxury">Luxury</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Travel Style</InputLabel>
          <Select
            value={formData.travelStyle}
            label="Travel Style"
            onChange={(e) => handleInputChange('travelStyle', e.target.value)}
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
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Group Size</InputLabel>
          <Select
            value={formData.groupSize}
            label="Group Size"
            onChange={(e) => handleInputChange('groupSize', e.target.value)}
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
  );

  const renderDailyActivities = () => (
    <Box>
      {formData.days.map((day) => (
        <Card key={day.dayNumber} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Day {day.dayNumber}</Typography>
              <Button
                startIcon={<Add />}
                onClick={() => handleAddActivity(day.dayNumber)}
                variant="outlined"
                size="small"
              >
                Add Activity
              </Button>
            </Box>
            
            {day.activities.map((activity, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {activity.time} - {activity.activity.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => handleDeleteActivity(day.dayNumber, index)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Paper>
            ))}
            
            {day.activities.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={2}>
                No activities planned for this day
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderAccommodations = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Accommodations</Typography>
        <Button startIcon={<Add />} onClick={handleAddAccommodation} variant="outlined">
          Add Accommodation
        </Button>
      </Box>
      
      {formData.accommodations.map((acc, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={acc.name}
                  onChange={(e) => handleUpdateAccommodation(index, 'name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={acc.type}
                    label="Type"
                    onChange={(e) => handleUpdateAccommodation(index, 'type', e.target.value)}
                  >
                    <MenuItem value="Hotel">Hotel</MenuItem>
                    <MenuItem value="Hostel">Hostel</MenuItem>
                    <MenuItem value="Resort">Resort</MenuItem>
                    <MenuItem value="Apartment">Apartment</MenuItem>
                    <MenuItem value="Villa">Villa</MenuItem>
                    <MenuItem value="Camping">Camping</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Check-in Date"
                  type="date"
                  value={acc.checkIn}
                  onChange={(e) => handleUpdateAccommodation(index, 'checkIn', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Check-out Date"
                  type="date"
                  value={acc.checkOut}
                  onChange={(e) => handleUpdateAccommodation(index, 'checkOut', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={acc.location}
                  onChange={(e) => handleUpdateAccommodation(index, 'location', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cost"
                  type="number"
                  value={acc.cost}
                  onChange={(e) => handleUpdateAccommodation(index, 'cost', e.target.value)}
                />
              </Grid>
              <Grid item xs={11}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={acc.notes}
                  onChange={(e) => handleUpdateAccommodation(index, 'notes', e.target.value)}
                />
              </Grid>
              <Grid item xs={1} display="flex" alignItems="center">
                <IconButton
                  onClick={() => handleDeleteAccommodation(index)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderTransportation = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Transportation</Typography>
        <Button startIcon={<Add />} onClick={handleAddTransportation} variant="outlined">
          Add Transportation
        </Button>
      </Box>
      
      {formData.transportation.map((trans, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={trans.type}
                    label="Type"
                    onChange={(e) => handleUpdateTransportation(index, 'type', e.target.value)}
                  >
                    <MenuItem value="Flight">Flight</MenuItem>
                    <MenuItem value="Train">Train</MenuItem>
                    <MenuItem value="Bus">Bus</MenuItem>
                    <MenuItem value="Car">Car</MenuItem>
                    <MenuItem value="Taxi">Taxi</MenuItem>
                    <MenuItem value="Walking">Walking</MenuItem>
                    <MenuItem value="Boat">Boat</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="From"
                  value={trans.from}
                  onChange={(e) => handleUpdateTransportation(index, 'from', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="To"
                  value={trans.to}
                  onChange={(e) => handleUpdateTransportation(index, 'to', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Cost"
                  type="number"
                  value={trans.cost}
                  onChange={(e) => handleUpdateTransportation(index, 'cost', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  type="datetime-local"
                  value={trans.departureTime}
                  onChange={(e) => handleUpdateTransportation(index, 'departureTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Arrival Time"
                  type="datetime-local"
                  value={trans.arrivalTime}
                  onChange={(e) => handleUpdateTransportation(index, 'arrivalTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={11}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={trans.notes}
                  onChange={(e) => handleUpdateTransportation(index, 'notes', e.target.value)}
                />
              </Grid>
              <Grid item xs={1} display="flex" alignItems="center">
                <IconButton
                  onClick={() => handleDeleteTransportation(index)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderPackingAndTips = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>Packing List</Typography>
        {['Clothing', 'Electronics', 'Toiletries', 'Documents', 'Accessories', 'Other'].map(category => (
          <Card key={category} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1">{category}</Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleAddPackingItem(category)}
                >
                  Add Item
                </Button>
              </Box>
              <List dense>
                {(formData.packingList.find(item => item.category === category)?.items || []).map((item, index) => (
                  <ListItem key={index}>
                    <TextField
                      fullWidth
                      size="small"
                      value={item}
                      onChange={(e) => handleUpdatePackingItem(category, index, e.target.value)}
                      placeholder={`Add ${category.toLowerCase()} item`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePackingItem(category, index)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Travel Tips</Typography>
          <Button startIcon={<Add />} onClick={handleAddTip} variant="outlined">
            Add Tip
          </Button>
        </Box>
        
        {formData.tips.map((tip, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={tip}
                  onChange={(e) => handleUpdateTip(index, e.target.value)}
                  placeholder="Add a travel tip"
                />
                <IconButton
                  onClick={() => handleDeleteTip(index)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Grid>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderDailyActivities();
      case 2:
        return renderAccommodations();
      case 3:
        return renderTransportation();
      case 4:
        return renderPackingAndTips();
      default:
        return null;
    }
  };

  if (loading && id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {id ? 'Edit Itinerary' : 'Create New Itinerary'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        {renderStepContent(activeStep)}
      </Paper>

      <Box display="flex" justifyContent="space-between">
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<Cancel />}
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            >
              {loading ? 'Saving...' : 'Save Itinerary'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!formData.title || !formData.destination || formData.duration.days < 1}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Activity Dialog */}
      <Dialog open={dayDialogOpen} onClose={() => setDayDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Activity for Day {currentDay}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time"
                value={newActivity.time}
                onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                placeholder="e.g., 9:00 AM"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={newActivity.activity.type}
                  label="Activity Type"
                  onChange={(e) => setNewActivity(prev => ({
                    ...prev,
                    activity: { ...prev.activity, type: e.target.value }
                  }))}
                >
                  <MenuItem value="Sightseeing">Sightseeing</MenuItem>
                  <MenuItem value="Dining">Dining</MenuItem>
                  <MenuItem value="Accommodation">Accommodation</MenuItem>
                  <MenuItem value="Transportation">Transportation</MenuItem>
                  <MenuItem value="Activity">Activity</MenuItem>
                  <MenuItem value="Free Time">Free Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Activity Name"
                value={newActivity.activity.name}
                onChange={(e) => setNewActivity(prev => ({
                  ...prev,
                  activity: { ...prev.activity, name: e.target.value }
                }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={newActivity.activity.description}
                onChange={(e) => setNewActivity(prev => ({
                  ...prev,
                  activity: { ...prev.activity, description: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={newActivity.activity.location}
                onChange={(e) => setNewActivity(prev => ({
                  ...prev,
                  activity: { ...prev.activity, location: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration"
                value={newActivity.activity.duration}
                onChange={(e) => setNewActivity(prev => ({
                  ...prev,
                  activity: { ...prev.activity, duration: e.target.value }
                }))}
                placeholder="e.g., 2 hours"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={newActivity.activity.cost}
                onChange={(e) => setNewActivity(prev => ({
                  ...prev,
                  activity: { ...prev.activity, cost: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notes"
                value={newActivity.activity.notes}
                onChange={(e) => setNewActivity(prev => ({
                  ...prev,
                  activity: { ...prev.activity, notes: e.target.value }
                }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDayDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveActivity} variant="contained">
            Add Activity
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateItinerary;
