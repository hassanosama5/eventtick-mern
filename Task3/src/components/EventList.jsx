import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './EventList.css';

const EventList = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize auth only once
    useEffect(() => {
        const initializeAuth = async () => {
            if (isInitialized) return;
            
            try {
                // First try to get token from localStorage
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                
                if (!token || !storedUser) {
                    // If no token or user data, try to login with test credentials
                    const credentials = {
                        email: 'test@example.com',
                        password: 'password123'
                    };
                    
                    console.log('Attempting to login...');
                    try {
                        const loginResponse = await authService.login(credentials);
                        console.log('Login response:', loginResponse);
                        
                        if (loginResponse.success) {
                            await login(loginResponse.data.token, loginResponse.data.user);
                        } else {
                            throw new Error('Login failed: ' + loginResponse.message);
                        }
                    } catch (loginError) {
                        // If login fails, try to register
                        console.log('Login failed, attempting registration...', loginError);
                        const userData = {
                            name: 'Test Organizer',
                            email: 'test@example.com',
                            password: 'password123',
                            role: 'organizer'
                        };
                        
                        try {
                            const registerResponse = await authService.register(userData);
                            console.log('Registration response:', registerResponse);
                            
                            if (registerResponse.success) {
                                // Login with the registered user
                                const newLoginResponse = await authService.login(credentials);
                                if (newLoginResponse.success) {
                                    await login(newLoginResponse.data.token, newLoginResponse.data.user);
                                } else {
                                    throw new Error('Login failed after registration');
                                }
                            } else {
                                throw new Error('Registration failed: ' + registerResponse.message);
                            }
                        } catch (registerError) {
                            console.error('Registration failed:', registerError);
                            setError('Failed to register: ' + (registerError.response?.data?.message || registerError.message));
                        }
                    }
                } else {
                    // If we have stored data, use it
                    const user = JSON.parse(storedUser);
                    await login(token, user);
                }
                setIsInitialized(true);
            } catch (err) {
                console.error('Authentication error:', err);
                setError('Failed to authenticate: ' + (err.response?.data?.message || err.message));
                setIsInitialized(true);
            }
        };
        initializeAuth();
    }, [login, isInitialized]);

    // Fetch events only after initialization
    useEffect(() => {
        if (isInitialized) {
            fetchEvents();
        }
    }, [isInitialized]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching events...');
            const response = await eventService.getAllEvents();
            console.log('Raw response from server:', response);
            
            if (response && response.success && Array.isArray(response.data)) {
                // Filter for approved events only
                const approvedEvents = response.data.filter(event => event.status === 'approved');
                console.log('Approved events:', approvedEvents);
                
                const formattedEvents = approvedEvents.map(event => ({
                    ...event,
                    _id: event._id || event.id
                }));
                console.log('Formatted events:', formattedEvents);
                setEvents(formattedEvents);
            } else {
                console.error('Invalid response format:', response);
                setError('Invalid response format from server');
            }
        } catch (err) {
            console.error('Error fetching events:', {
                error: err,
                response: err.response,
                message: err.message,
                data: err.response?.data
            });
            setError(err.response?.data?.message || 'Failed to fetch events. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!id) {
            console.error('No event ID provided for deletion');
            setError('Invalid event ID');
            return;
        }

        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                setLoading(true);
                console.log('Starting delete operation for event:', id);
                const response = await eventService.deleteEvent(id);
                console.log('Delete operation response:', response);
                
                if (response && response.success) {
                    console.log('Delete successful, updating events list');
                    setEvents(prevEvents => {
                        const updatedEvents = prevEvents.filter(event => {
                            const eventId = event._id || event.id;
                            return eventId !== id;
                        });
                        console.log('Events after deletion:', updatedEvents);
                        return updatedEvents;
                    });
                } else {
                    console.error('Delete operation failed:', response?.message);
                    setError(response?.message || 'Failed to delete event');
                }
            } catch (err) {
                console.error('Delete operation error:', {
                    error: err,
                    response: err.response,
                    message: err.message
                });
                setError(err.response?.data?.message || 'Failed to delete event. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (id) => {
        if (!id) {
            console.error('No event ID provided for edit');
            setError('Invalid event ID');
            return;
        }
        console.log('Starting edit operation for event:', id);
        navigate(`/events/edit/${id}`);
    };

    const handleAnalytics = (id) => {
        if (!id) {
            console.error('No event ID provided for analytics');
            setError('Invalid event ID');
            return;
        }
        console.log('Navigating to event analytics:', id);
        navigate(`/events/${id}/analytics`);
    };

    const handleCreate = () => {
        console.log('Starting create operation');
        navigate('/events/create');
    };

    const handleViewDetails = (id) => {
        if (!id) {
            console.error('No event ID provided for details');
            setError('Invalid event ID');
            return;
        }
        console.log('Navigating to event details:', id);
        navigate(`/events/${id}`);
    };

    // Filter events based on search term, category, and date
    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !categoryFilter || event.category === categoryFilter;
        
        const matchesDate = !dateFilter || new Date(event.date).toDateString() === new Date(dateFilter).toDateString();
        
        return matchesSearch && matchesCategory && matchesDate;
    });

    if (loading && !isInitialized) return <div className="loading">Loading events...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="event-list-container">
            <div className="event-list-header">
                <h2>Event Ticketing System</h2>
                <button 
                    className="create-event-btn"
                    onClick={handleCreate}
                >
                    Create New Event
                </button>
            </div>

            <div className="filters-section">
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="category-filter"
                >
                    <option value="">All Categories</option>
                    <option value="music">Music</option>
                    <option value="sports">Sports</option>
                    <option value="technology">Technology</option>
                    <option value="food">Food</option>
                    <option value="arts">Arts</option>
                    <option value="business">Business</option>
                </select>

                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="date-filter"
                />
            </div>

            {loading ? (
                <div className="loading">Loading events...</div>
            ) : !filteredEvents || filteredEvents.length === 0 ? (
                <div className="no-events">
                    <p>No events available at the moment.</p>
                    <button 
                        className="create-event-btn"
                        onClick={handleCreate}
                    >
                        Create Your First Event
                    </button>
                </div>
            ) : (
                <div className="events-grid">
                    {filteredEvents.map(event => {
                        const eventId = event._id || event.id;
                        if (!eventId) {
                            console.error('Event missing ID:', event);
                            return null;
                        }
                        return (
                            <div key={eventId} className="event-card">
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
                                        className="view-btn"
                                        onClick={() => handleViewDetails(eventId)}
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        className="edit-btn"
                                        onClick={() => handleEdit(eventId)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="analytics-btn"
                                        onClick={() => handleAnalytics(eventId)}
                                    >
                                        Analytics
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDelete(eventId)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventList; 