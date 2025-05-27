import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
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
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { format } from "date-fns";
import Toast from "../Toast";
import Loader from "../Loader";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Ensure axios sends cookies with every request
axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/users/bookings`);
      setBookings(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch bookings. Please try again."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "standard") {
      fetchBookings();
    }
  }, [user]);

  // Handle unauthorized access
  if (!user || user.role !== "standard") {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Only standard users can view bookings. Please log in with a standard
          user account.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Loader size={60} />
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
      await axios.delete(`${API_BASE_URL}/api/v1/bookings/${bookingToCancel}`);
      setBookings(
        bookings.filter((booking) => booking._id !== bookingToCancel)
      );
      setToast({ message: "Booking cancelled successfully.", type: "success" });
      handleCloseCancelDialog();
    } catch (err) {
      setToast({
        message:
          err.response?.data?.message ||
          "Failed to cancel booking. Please try again.",
        type: "error",
      });
      handleCloseCancelDialog();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
                    primary={booking.event?.title || "Event Not Available"}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        Date:{" "}
                        {booking.event?.date
                          ? format(new Date(booking.event.date), "PPP p")
                          : "N/A"}{" "}
                        | Tickets: {booking.quantity} | Total Price: $
                        {booking.totalPrice?.toFixed(2)}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleCancelClick(booking._id)}
                      disabled={
                        !booking.event ||
                        new Date(booking.event.date) < new Date()
                      }
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
        <DialogTitle id="cancel-booking-dialog-title">
          Confirm Cancellation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-booking-dialog-description">
            Are you sure you want to cancel this booking?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>No</Button>
          <Button onClick={handleConfirmCancel} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserBookings;
