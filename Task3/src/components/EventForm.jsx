import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services/api';
import './EventForm.css';
import axios from 'axios';

const categoryOptions = [
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'webinar', label: 'Webinar' },
];

const EventForm = ({ isEdit = false, onEventCreated }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        price: '',
        totalTickets: '',
        category: 'conference'
    });

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
                // Ensure all fields have default values
                setFormData({
                    title: eventData.title || '',
                    description: eventData.description || '',
                    date: eventData.date ? new Date(eventData.date).toISOString().slice(0, 16) : '',
                    location: eventData.location || '',
                    price: eventData.price ? eventData.price.toString() : '',
                    totalTickets: eventData.totalTickets ? eventData.totalTickets.toString() : '',
                    category: eventData.category || 'conference'
                });
            } else {
                setError('Invalid event data received');
            }
        } catch (err) {
            console.error('Error fetching event:', err);
            setError('Failed to fetch event details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Format the event data with proper type conversion
            const eventData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                date: new Date(formData.date).toISOString(),
                location: formData.location.trim(),
                price: parseFloat(formData.price),
                totalTickets: parseInt(formData.totalTickets, 10),
                category: formData.category
            };

            console.log('Submitting event data:', eventData);

            let response;
            if (isEdit && id) {
                console.log('Updating event with ID:', id);
                response = await eventService.updateEvent(id, eventData);
            } else {
                console.log('Creating new event');
                response = await eventService.createEvent(eventData);
            }
            
            if (response.success) {
                console.log('Operation successful, navigating to events list');
                navigate('/');
                if (onEventCreated) onEventCreated();
            } else {
                console.error('Operation failed:', response.message);
                setError(response.message || `Failed to ${isEdit ? 'update' : 'create'} event`);
            }
        } catch (err) {
            console.error('Error submitting event:', err);
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} event`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) return <div className="loading">Loading...</div>;

    return (
        <div className="event-form-container">
            <h2>{isEdit ? 'Edit Event' : 'Create New Event'}</h2>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
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
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate('/my-events')}
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm; 