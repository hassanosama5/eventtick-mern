import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import './MyEventsPage.css';

const MyEventsPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching organizer events...'); // Debug log
            const response = await eventService.getOrganizerEvents();
            console.log('Organizer events response:', response); // Debug log
            if (response.success) {
                setEvents(response.data);
            } else {
                setError(response.message || 'Failed to fetch your events');
            }
        } catch (err) {
            console.error('Error fetching organizer events:', err); // Debug log
            setError(err.response?.data?.message || 'Failed to fetch your events. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await eventService.deleteEvent(id);
                if (response.success) {
                    setEvents(events.filter(event => event._id !== id));
                }
            } catch (err) {
                setError('Failed to delete event');
            }
        }
    };

    if (loading) return <div className="loading">Loading your events...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="my-events-container">
            <div className="my-events-header">
                <h2>My Events</h2>
                <button 
                    className="create-event-btn"
                    onClick={() => navigate('/events/create')}
                >
                    Create New Event
                </button>
            </div>

            {events.length === 0 ? (
                <div className="no-events">
                    <p>You haven't created any events yet.</p>
                    <button 
                        className="create-event-btn"
                        onClick={() => navigate('/events/create')}
                    >
                        Create Your First Event
                    </button>
                </div>
            ) : (
                <div className="events-grid">
                    {events.map(event => (
                        <div key={event._id} className="event-card">
                            <div className="event-header">
                                <h3>{event.title}</h3>
                                <span className={`event-status ${event.status}`}>
                                    {event.status}
                                </span>
                            </div>
                            
                            <div className="event-details">
                                <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
                                <p><strong>Location:</strong> {event.location}</p>
                                <p><strong>Price:</strong> ${event.price}</p>
                                <p><strong>Available Tickets:</strong> {event.availableTickets}</p>
                                <p><strong>Total Tickets:</strong> {event.totalTickets}</p>
                            </div>

                            <div className="event-actions">
                                <button 
                                    className="edit-btn"
                                    onClick={() => navigate(`/events/edit/${event._id}`)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="analytics-btn"
                                    onClick={() => navigate(`/events/${event._id}/analytics`)}
                                >
                                    Analytics
                                </button>
                                <button 
                                    className="delete-btn"
                                    onClick={() => handleDelete(event._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyEventsPage; 