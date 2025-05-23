import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventService } from "../services/api";
import "./CreateEvent.css";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    totalTickets: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventService.getEventById(id);
        if (response.success) {
          const eventData = response.data;
          // Format date for input field (YYYY-MM-DDTHH:mm)
          const formattedDate = new Date(eventData.date)
            .toISOString()
            .slice(0, 16);
          setEvent({
            ...eventData,
            date: formattedDate,
          });
        } else {
          setError("Failed to fetch event details");
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.message || "Failed to fetch event details"
        );
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await eventService.updateEvent(id, event);
      if (response.success) {
        navigate("/");
      } else {
        setError("Failed to update event");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update event");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="create-event-container">
      <h2>Edit Event</h2>
      <form onSubmit={handleSubmit} className="create-event-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={event.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="datetime-local"
            name="date"
            value={event.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={event.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={event.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Total Tickets:</label>
          <input
            type="number"
            name="totalTickets"
            value={event.totalTickets}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={event.category}
            onChange={handleChange}
          />
        </div>

        <div className="button-group">
          <button type="submit" className="submit-button">
            Update Event
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
