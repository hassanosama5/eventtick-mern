import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { format } from 'date-fns';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your bookings.');
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_BASE_URL}users/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelClick = (bookingId) => {
    setBookingToCancel(bookingId);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setBookingToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}bookings/${bookingToCancel}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the cancelled booking from the state
      setBookings(bookings.filter(booking => booking._id !== bookingToCancel));
      handleCloseCancelDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
      handleCloseCancelDialog();
    }
  };

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Typography variant="h6" textAlign="center" color="text.secondary">
          You have no bookings yet.
        </Typography>
      ) : (
        <Paper elevation={3}>
          <List>
            {bookings.map((booking, index) => (
              <React.Fragment key={booking._id}>
                <ListItem>
                  <ListItemText
                    primary={booking.event?.title || 'Event Not Available'}
                    secondary={
                      <Typography component="span" variant="body2" color="text.secondary">
                        Date: {booking.event?.date ? format(new Date(booking.event.date), 'PPP p') : 'N/A'} | 
                        Tickets: {booking.quantity} | 
                        Total Price: ${booking.totalPrice?.toFixed(2)}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleCancelClick(booking._id)}
                      disabled={!booking.event || new Date(booking.event.date) < new Date()}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < bookings.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-booking-dialog-title"
        aria-describedby="cancel-booking-dialog-description"
      >
        <DialogTitle id="cancel-booking-dialog-title">Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-booking-dialog-description">
            Are you sure you want to cancel this booking?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>No</Button>
          <Button onClick={handleConfirmCancel} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserBookings; 