import React, { useState, useEffect } from "react";
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
  Grid,
} from "@mui/material";
import axios from "axios";
import EventCard from "./events/EventCard";

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/events`, {
        withCredentials: true, // send cookie automatically
      });

      // Sort events to show pending events first
      const sortedEvents = response.data.data.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") {
          return -1; // a (pending) comes before b
        } else if (a.status !== "pending" && b.status === "pending") {
          return 1; // b (pending) comes before a
        }
        // Keep original order for events with the same pending status (or neither are pending)
        return 0;
      });

      setEvents(sortedEvents); // Set sorted events
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch events");
      setLoading(false);
      console.error("Error fetching events:", err);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/v1/events/${eventId}/status`,
        { status: "approved" },
        {
          withCredentials: true, // send cookie automatically
        }
      );
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error approving event:", error);
      // Optionally set an error state to display a user-friendly message
    }
  };

  const handleDecline = async (eventId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/v1/events/${eventId}/status`,
        { status: "declined" },
        {
          withCredentials: true, // send cookie automatically
        }
      );
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error declining event:", error);
      // Optionally set an error state
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
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
      case "pending":
        return "#fffacd"; // Light yellow
      case "approved":
        return "#90ee90"; // Light green
      case "declined":
        return "#ffb6c1"; // Light red
      default:
        return "#ffffff"; // Default white or alternating color
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    if (filter === "pending" && event.status === "pending") return true;
    if (filter === "approved" && event.status === "approved") return true;
    if (filter === "declined" && event.status === "declined") return true;
    return false;
  });

  return (
    <Box p={3} sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#333", textAlign: "center" }}
      >
        Events Management
      </Typography>

      {/* Filter Buttons */}
      <Box mb={3} display="flex" justifyContent="center">
        <ButtonGroup
          variant="contained"
          aria-label="event status filter buttons"
        >
          <Button
            onClick={() => setFilter("all")}
            color={filter === "all" ? "primary" : "default"}
            sx={{ textTransform: "none" }}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter("pending")}
            color={filter === "pending" ? "primary" : "default"}
            sx={{ textTransform: "none" }}
          >
            Pending
          </Button>
          <Button
            onClick={() => setFilter("approved")}
            color={filter === "approved" ? "success" : "default"}
            sx={{ textTransform: "none" }}
          >
            Approved
          </Button>
          <Button
            onClick={() => setFilter("declined")}
            color={filter === "declined" ? "error" : "default"}
            sx={{ textTransform: "none" }}
          >
            Declined
          </Button>
        </ButtonGroup>
      </Box>

      {filteredEvents.length === 0 ? (
        <Typography variant="h6" textAlign="center" color="text.secondary">
          No events found matching your criteria
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item key={event._id} xs={12} sm={6} md={4}>
              <EventCard
                event={event}
                onApprove={handleApprove}
                onDecline={handleDecline}
                showActions={true}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Events;
