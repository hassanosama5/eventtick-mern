import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const BookTicketForm = ({ eventId, ticketPrice, availableTickets }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= availableTickets) {
      setQuantity(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/v1/bookings',
        {
          eventId,
          quantity,
          totalPrice: quantity * ticketPrice
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess(true);
      setQuantity(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Book Tickets
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Tickets booked successfully!
        </Alert>
      )}

      <TextField
        fullWidth
        type="number"
        label="Number of Tickets"
        value={quantity}
        onChange={handleQuantityChange}
        inputProps={{ min: 1, max: availableTickets }}
        sx={{ mb: 2 }}
      />

      <Typography variant="body1" gutterBottom>
        Total Price: ${(quantity * ticketPrice).toFixed(2)}
      </Typography>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading || quantity < 1 || quantity > availableTickets}
        sx={{ mt: 2 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Book Now'
        )}
      </Button>
    </Box>
  );
};

export default BookTicketForm; 