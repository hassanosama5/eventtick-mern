import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from './services/api';
import './CreateEvent.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    totalTickets: '',
    category: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert price and totalTickets to numbers
      const eventData = {
        ...formData,
        price: Number(formData.price),
        totalTickets: Number(formData.totalTickets)
      };

      const response = await eventService.createEvent(eventData);
      console.log('Event created:', response);
      
      // Redirect to events list
      navigate('/');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <h1>Create New Event</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-event-form">
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
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="concert">Concert</option>
            <option value="exhibition">Exhibition</option>
            <option value="entertainment">Entertainment</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
} 