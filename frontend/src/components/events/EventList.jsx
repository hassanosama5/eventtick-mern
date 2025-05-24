import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  TextField,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup,
  Paper,
  Skeleton,
} from "@mui/material";
import EventCard from "./EventCard";
import axios from "axios";
import { CalendarToday, GridView, List as ListIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const EventList = ({ events: initialEvents }) => {
  const [events, setEvents] = useState(initialEvents || []);
  const [filteredEvents, setFilteredEvents] = useState(initialEvents || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const navigate = useNavigate();

  const categories = [
    "conference",
    "workshop",
    "seminar",
    "concert",
    "exhibition",
    "other",
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/events/approved",
          {
            withCredentials: true,
          }
        );
        setEvents(response.data.data);
        setFilteredEvents(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch events. Please try again later.");
        setLoading(false);
      }
    };

    if (!initialEvents) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [initialEvents]);

  useEffect(() => {
    const filtered = events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || event.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    setFilteredEvents(filtered);
  }, [searchTerm, categoryFilter, events]);

  const handleCalendarEventClick = (event) => {
    navigate(`/events/${event._id}`);
  };

  const calendarEvents = filteredEvents.map((event) => ({
    _id: event._id,
    title: event.title,
    start: new Date(event.date),
    end: new Date(event.date),
  }));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item key={i} xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
                <Skeleton variant="rectangular" height={140} />
                <Box sx={{ pt: 2 }}>
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                  <Skeleton width="30%" />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">Upcoming Events</Typography>
        <ButtonGroup variant="contained" size="small">
          <Button
            onClick={() => setViewMode("grid")}
            color={viewMode === "grid" ? "primary" : "inherit"}
          >
            <GridView sx={{ mr: 1 }} /> Grid
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            color={viewMode === "list" ? "primary" : "inherit"}
          >
            <ListIcon sx={{ mr: 1 }} /> List
          </Button>
          <Button
            onClick={() => setViewMode("calendar")}
            color={viewMode === "calendar" ? "primary" : "inherit"}
          >
            <CalendarToday sx={{ mr: 1 }} /> Calendar
          </Button>
        </ButtonGroup>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search events"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event name or location"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {filteredEvents.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            🔍
          </Typography>
          <Typography variant="h5" sx={{ mb: 1 }}>
            No events found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your filters or search terms
          </Typography>
        </Box>
      ) : viewMode === "calendar" ? (
        <Box sx={{ height: 700 }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            onSelectEvent={handleCalendarEventClick}
          />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid
              item
              key={event._id}
              xs={12}
              sm={viewMode === "list" ? 12 : 6}
              md={viewMode === "list" ? 12 : 4}
            >
              <EventCard event={event} viewMode={viewMode} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EventList;
