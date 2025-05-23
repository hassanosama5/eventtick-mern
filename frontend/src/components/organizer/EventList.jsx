import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./EventList.css";

const OrganizerEventList = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/v1/events/organizer", // <-- updated URL here
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/events/${id}`, {
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
        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className={`event-status ${event.status}`}>
                  {event.status}
                </span>
              </div>

              <div className="event-actions">
                <button onClick={() => navigate(`/events/${event._id}`)}>
                  View
                </button>
                <button
                  onClick={() =>
                    navigate(`/organizer/events/edit/${event._id}`)
                  }
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    navigate(`/organizer/events/${event._id}/analytics`)
                  }
                >
                  Analytics
                </button>
                <button onClick={() => handleDelete(event._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerEventList;
