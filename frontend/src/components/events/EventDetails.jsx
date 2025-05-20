import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import BookTicketForm from './BookTicketForm';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/events/${id}`);
        setEvent(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch event details. Please try again later.');
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.get('/api/v1/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    fetchEventDetails();
    checkAuth();
  }, [id]);

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

  if (!event) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Event Image */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: 400,
              backgroundImage: `url(${event.imageUrl || '/default-event.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2
            }}
          />
        </Grid>

        {/* Event Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {event.title}
            </Typography>
            
            <Chip 
              label={event.category} 
              color="primary" 
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" color="primary" gutterBottom>
              ${event.ticketPrice}
            </Typography>

            <Box sx={{ my: 2 }}>
              <Typography variant="body1" gutterBottom>
                📅 {format(new Date(event.date), 'PPP')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                🕒 {format(new Date(event.date), 'p')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                📍 {event.location}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Available Tickets: {event.availableTickets}
              </Typography>
            </Box>

            {isAuthenticated ? (
              <BookTicketForm 
                eventId={event._id} 
                ticketPrice={event.ticketPrice}
                availableTickets={event.availableTickets}
              />
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Login to Book Tickets
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetails; 