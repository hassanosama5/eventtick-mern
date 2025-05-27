import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./EventList.css";
import EventCard from "../events/EventCard";
import {
  Button,
  ButtonGroup,
  TextField,
  MenuItem,
  Box,
  Grid,
} from "@mui/material";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrganizerEventList = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const eventsPerPage = 6;
  const categories = [
    "conference",
    "workshop",
    "seminar",
    "concert",
    "exhibition",
    "other",
    "sports",
  ];

  // Filter events by search and category
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/events/organizer`,
          { withCredentials: true }
        );

        if (response.data && Array.isArray(response.data.data)) {
          setEvents(response.data.data);
        } else {
          setError("Invalid response format");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setCurrentPage(1);
  }, [events.length, searchTerm, categoryFilter]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/events/${id}`, {
        withCredentials: true,
      });
      setEvents(events.filter((event) => event._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete event");
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h2>My Events</h2>
        <button
          className="create-event-btn"
          onClick={() => navigate("/organizer/events/create")}
        >
          Create New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>You haven't created any events yet.</p>
        </div>
      ) : (
        <>
          {/* Search and filter bar */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  variant="outlined"
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
          <div style={{ padding: "16px 0" }}>
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 24,
                      justifyContent: "center",
                    }}
                  >
                    {paginatedEvents.map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        viewMode="grid"
                        showOrganizerActions={true}
                        onEdit={() =>
                          navigate(`/organizer/events/edit/${event._id}`)
                        }
                        onDelete={() => handleDelete(event._id)}
                        onAnalytics={() =>
                          navigate(`/organizer/events/${event._id}/analytics`)
                        }
                        onView={() => navigate(`/events/${event._id}`)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {filteredEvents.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 32,
              }}
            >
              <ButtonGroup variant="outlined">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, idx) => (
                  <Button
                    key={idx + 1}
                    variant={currentPage === idx + 1 ? "contained" : "outlined"}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </ButtonGroup>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrganizerEventList;
