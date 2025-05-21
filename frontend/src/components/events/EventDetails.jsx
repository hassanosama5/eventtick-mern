import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Chip,
} from "@mui/material";
import { format } from "date-fns";
import axios from "axios";
import BookTicketForm from "./BookTicketForm";

// Helper API URL
//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated by calling backend auth check endpoint
  const checkAuthStatus = async () => {
    try {
      // Backend should have an endpoint like /api/v1/auth/me that reads cookie and returns user info or 401
      await axios.get("http://localhost:5000/api/v1/users/profile", {
        withCredentials: true, // send cookies automatically
      });
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/events/${id}`,
        {
          withCredentials: true, // send cookie just in case needed by backend
        }
      );
      setEvent(response.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch event details. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus(); // Check if logged in when component mounts
    fetchEventDetails();
  }, [id]);

  // Callback after successful booking to refresh event details
  const handleBookingSuccess = () => {
    fetchEventDetails();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Event not found
        </Alert>
      </Container>
    );
  }

  const eventPrice = event?.price;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Event Image */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: 400,
              backgroundImage: `url(${
                event?.imageUrl || "/default-event.jpg"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 2,
            }}
          />
        </Grid>

        {/* Event Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {event?.title}
            </Typography>

            <Chip label={event?.category} color="primary" sx={{ mb: 2 }} />

            <Typography variant="h6" color="primary" gutterBottom>
              ${eventPrice}
            </Typography>

            <Box sx={{ my: 2 }}>
              <Typography variant="body1" gutterBottom>
                📅 {format(new Date(event?.date), "PPP p")}
              </Typography>
              <Typography variant="body1" gutterBottom>
                📍 {event?.location}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" paragraph>
              {event?.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Available Tickets: {event?.availableTickets}
              </Typography>
            </Box>

            {isAuthenticated && event ? (
              <BookTicketForm
                eventId={event._id}
                ticketPrice={event.price}
                availableTickets={event.availableTickets}
                onBookingSuccess={handleBookingSuccess}
              />
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate("/login")}
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
