import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import axios from "axios";
import Toast from "../Toast";
import Loader from "../Loader";

const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL;

const BookTicketForm = ({
  eventId,
  ticketPrice,
  availableTickets,
  onBookingSuccess,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const handleQuantityChange = (newQuantity) => {
    const value = Math.max(1, Math.min(availableTickets, newQuantity));
    setQuantity(value);
  };

  const handleSubmit = async (e) => {
    console.log("handleSubmit entered");
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 🧠 Auth is now handled by cookies — no need to check localStorage
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/bookings`,
        {
          eventId,
          quantity,
          totalPrice: quantity * ticketPrice,
        },
        {
          withCredentials: true, // Send cookies to the server
        }
      );

      if (response.data && response.data.success) {
        setSuccess(true);
        setToast({ message: "Tickets booked successfully!", type: "success" });
        setQuantity(1);
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      } else {
        setError(response.data?.message || "Booking failed.");
        setToast({ message: response.data?.message || "Booking failed.", type: "error" });
      }
    } catch (err) {
      console.error(
        "Booking API error:",
        err.response?.data?.message || err.message
      );
      // If user is not logged in, the backend should return 401 Unauthorized
      if (err.response?.status === 401) {
        setError("Please log in to book tickets.");
        setToast({ message: "Please log in to book tickets.", type: "error" });
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to book tickets. Please try again."
        );
        setToast({ message: err.response?.data?.message || "Failed to book tickets. Please try again.", type: "error" });
      }
    } finally {
      setLoading(false);
      console.log("handleSubmit finished");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Book Your Tickets
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} icon={false}>
            ⚠️ {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} icon={false}>
            🎉 Tickets booked successfully!
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Available tickets: {availableTickets}
          </Typography>

          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <IconButton
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || loading}
                size="small"
                color="primary"
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <Remove />
              </IconButton>
            </Grid>
            <Grid item>
              <TextField
                variant="outlined"
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                inputProps={{
                  min: 1,
                  max: availableTickets,
                  style: { textAlign: "center", width: 60 },
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= availableTickets || loading}
                size="small"
                color="primary"
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <Add />
              </IconButton>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1} sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body1">Price per ticket:</Typography>
            <Typography variant="body1">${ticketPrice.toFixed(2)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body1">Booking fee:</Typography>
            <Typography variant="body1">$2.50</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Total:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              ${(quantity * ticketPrice + quantity * 2.5).toFixed(2)}
            </Typography>
          </Box>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading || quantity < 1 || quantity > availableTickets}
          sx={{
            py: 1.5,
            fontWeight: 600,
            "&:disabled": { backgroundColor: "action.disabledBackground" },
          }}
        >
          {loading ? (
            <Loader size={24} />
          ) : (
            "Confirm Booking"
          )}
        </Button>

        <Typography variant="caption" display="block" textAlign="center" mt={2}>
          Secure checkout · Cancel up to 24 hours before event
        </Typography>
      </Box>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </Paper>
  );
};

export default BookTicketForm;
