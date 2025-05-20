import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  TextField, 
  Box, 
  Typography,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import EventCard from './EventCard';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [
    'all',
    'music',
    'sports',
    'arts',
    'food',
    'business',
    'technology'
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}events/approved`);
        setEvents(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Upcoming Events
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search events"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by event name or location"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              variant="outlined"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {filteredEvents.length === 0 ? (
        <Typography variant="h6" textAlign="center" color="text.secondary">
          No events found matching your criteria
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item key={event._id} xs={12} sm={6} md={4}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EventList; 