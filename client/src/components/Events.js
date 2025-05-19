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
  ButtonGroup,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/';

// *** Replace with your actual token for testing ***
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmIwZmU3NzczMjNmZTE5ODY3NjY0ZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzY1MjU4MywiZXhwIjoxNzUwMjQ0NTgzfQ.e_N_BcNG97eqvxNfEvpSiPpFuj9T2K6tOtyClCqcHiw';
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

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
      
      // Sort events to show pending events first
      const sortedEvents = response.data.data.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') {
          return -1; // a (pending) comes before b
        } else if (a.status !== 'pending' && b.status === 'pending') {
          return 1; // b (pending) comes before a
        }
        // Keep original order for events with the same pending status (or neither are pending)
        return 0;
      });

      setEvents(sortedEvents); // Set sorted events
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

  // Filter events based on the selected filter state
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

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

  // Function to get row background color based on status
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fffacd'; // Light yellow
      case 'approved':
        return '#90ee90'; // Light green
      case 'declined':
        return '#ffb6c1'; // Light red
      default:
        return '#ffffff'; // Default white or alternating color
    }
  };

  return (
    <Box p={3} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#333', textAlign: 'center' }}>
        Events Management
      </Typography>

      {/* Filter Buttons */}
      <Box mb={3} display="flex" justifyContent="center">
        <ButtonGroup variant="contained" aria-label="event status filter buttons">
          <Button
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
            sx={{ textTransform: 'none' }}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            color={filter === 'pending' ? 'primary' : 'default'}
            sx={{ textTransform: 'none' }}
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilter('approved')}
            color={filter === 'approved' ? 'success' : 'default'}
            sx={{ textTransform: 'none' }}
          >
            Approved
          </Button>
          <Button
            onClick={() => setFilter('declined')}
            color={filter === 'declined' ? 'error' : 'default'}
            sx={{ textTransform: 'none' }}
          >
            Declined
          </Button>
        </ButtonGroup>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Event Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event, index) => (
              <TableRow
                key={event._id}
                sx={{
                  // Apply status background color, fallback to alternating colors if no status color
                  backgroundColor: getStatusBackgroundColor(event.status) || (index % 2 === 0 ? '#f9f9f9' : '#ffffff'),
                  '&:hover': { backgroundColor: getStatusBackgroundColor(event.status) ? getStatusBackgroundColor(event.status) : '#f0f0f0' }, // Maintain status color on hover
                }}
              >
                <TableCell>{event.title}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.status}</TableCell>
                <TableCell>
                  {event.status === 'pending' && (
                    <Box display="flex">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApproval(event._id, 'approved')}
                        sx={{ mr: 1, textTransform: 'none' }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleApproval(event._id, 'rejected')}
                        sx={{ textTransform: 'none' }}
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