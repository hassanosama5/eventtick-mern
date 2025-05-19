import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/';

// *** Replace with your actual token for testing ***
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmIwZmU3NzczMjNmZTE5ODY3NjY0ZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzY1MjU4MywiZXhwIjoxNzUwMjQ0NTgzfQ.e_N_BcNG97eqvxNfEvpSiPpFuj9T2K6tOtyClCqcHiw';
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}events`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });
      setEvents(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events');
      setLoading(false);
      console.error('Error fetching events:', err);
    }
  };

  const handleApproval = async (eventId, status) => {
    try {
      // Map frontend status 'rejected' to backend status 'declined'
      const backendStatus = status === 'rejected' ? 'declined' : status;

      await axios.patch(`${API_BASE_URL}events/${eventId}/status`, {
        status: backendStatus
      }, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });
      // Refresh the events list
      fetchEvents();
    } catch (err) {
      setError('Failed to update event status');
      console.error('Error updating event:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Events Management
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event.title}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.status}</TableCell>
                <TableCell>
                  {event.status === 'pending' && (
                    <Box>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApproval(event._id, 'approved')}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleApproval(event._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Events; 