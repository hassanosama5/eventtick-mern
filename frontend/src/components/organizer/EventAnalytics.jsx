import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { eventService } from "../../services/api";
import EventAnalyticsChart from "./EventAnalyticsChart";
import { useAuth } from "../../context/AuthContext";
import { CircularProgress, Alert, Box, Typography, Paper } from "@mui/material";

const EventAnalytics = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user || (user.role !== "organizer" && user.role !== "admin")) {
          setError("Unauthorized access");
          return;
        }

        const response = await eventService.getEventAnalytics(id);

        if (response && response.data) {
          setEvent(response.data.event);
          setAnalytics(response.data.analytics);
        } else {
          setError(response?.message || "Invalid response format");
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id, user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2, mx: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!event || !analytics) {
    return (
      <Alert severity="warning" sx={{ mt: 2, mx: 2 }}>
        No analytics data available
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        maxWidth: 800,
        margin: "0 auto",
        "& .MuiTypography-h5": { fontSize: "1.25rem" },
        "& .MuiTypography-body2": { fontSize: "0.875rem" },
      }}
    >
      <Typography variant="h5" gutterBottom>
        {event.title} Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Event Date: {new Date(event.date).toLocaleDateString()}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{ p: 1.5, minWidth: 120, textAlign: "center" }}
          elevation={1}
        >
          <Typography variant="subtitle2">Total Tickets</Typography>
          <Typography variant="h6">{analytics.totalTickets}</Typography>
        </Paper>
        <Paper
          sx={{ p: 1.5, minWidth: 120, textAlign: "center" }}
          elevation={1}
        >
          <Typography variant="subtitle2">Tickets Sold</Typography>
          <Typography variant="h6">{analytics.bookedTickets}</Typography>
        </Paper>
        <Paper
          sx={{ p: 1.5, minWidth: 120, textAlign: "center" }}
          elevation={1}
        >
          <Typography variant="subtitle2">Revenue</Typography>
          <Typography variant="h6">${analytics.revenue}</Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          mt: 2,
          height: 300,
          width: "100%",
        }}
      >
        <EventAnalyticsChart event={event} analytics={analytics} height={280} />
      </Box>
    </Box>
  );
};

export default EventAnalytics;
