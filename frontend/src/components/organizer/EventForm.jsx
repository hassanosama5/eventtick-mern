import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventService, BACKEND_BASE_URL } from "../../services/api";
import "./EventForm.css";
import axios from "axios";
import Toast from "../Toast";
import Loader from "../Loader";

const categoryOptions = [
  { value: "Conference", label: "Conference" },
  { value: "Workshop", label: "Workshop" },
  { value: "Seminar", label: "Seminar" },
  { value: "Concert", label: "Concert" },
  { value: "Exhibition", label: "Exhibition" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Sports", label: "Sports" },
  { value: "Other", label: "Other" },
];

const EventForm = ({ isEdit = false, onEventCreated }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    totalTickets: "",
    category: "Conference",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isEdit && id) {
      fetchEvent();
    }
  }, [isEdit, id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id);
      if (response.success && response.data) {
        const eventData = response.data;
        setFormData({
          title: eventData.title || "",
          description: eventData.description || "",
          date: eventData.date
            ? new Date(eventData.date).toISOString().slice(0, 16)
            : "",
          location: eventData.location || "",
          price: eventData.price ? eventData.price.toString() : "",
          totalTickets: eventData.totalTickets
            ? eventData.totalTickets.toString()
            : "",
          category: eventData.category || "Conference",
          image: null,
        });
        if (eventData.image) {
          // Construct the full image URL for preview
          const fullImageUrl = `${BACKEND_BASE_URL}${eventData.image.startsWith('/') ? eventData.image : '/' + eventData.image}`;
          setImagePreview(fullImageUrl);
        }
      } else {
        setError("Invalid event data received");
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToast({ message: "Please select an image file", type: "error" });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: "Image size should be less than 5MB", type: "error" });
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('date', new Date(formData.date).toISOString());
      formDataToSend.append('location', formData.location.trim());
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('totalTickets', parseInt(formData.totalTickets, 10));
      formDataToSend.append('category', formData.category);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (isEdit && id) {
        response = await eventService.updateEvent(id, formDataToSend);
      } else {
        response = await eventService.createEvent(formDataToSend);
      }

      if (response.success) {
        setToast({ message: isEdit ? "Event updated successfully!" : "Event created successfully!", type: "success" });
        setTimeout(() => navigate("/organizer/events"), 1200);
        if (onEventCreated) onEventCreated();
      } else {
        setToast({ message: response.message || `Failed to ${isEdit ? "update" : "create"} event`, type: "error" });
        setError(response.message || `Failed to ${isEdit ? "update" : "create"} event`);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} event`, type: "error" });
      setError(err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} event`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <Loader size={60} />;

  return (
    <div className="event-form-container">
      <h2>{isEdit ? "Edit Event" : "Create New Event"}</h2>

      {error && <div className="error-message">{error}</div>}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter event title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter event description"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Event Date and Time *</label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Enter event location"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter ticket price"
            />
          </div>

          <div className="form-group">
            <label htmlFor="totalTickets">Total Tickets *</label>
            <input
              type="number"
              id="totalTickets"
              name="totalTickets"
              value={formData.totalTickets}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter total tickets"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Event Image</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="image-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Event preview" />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/organizer/events")}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
