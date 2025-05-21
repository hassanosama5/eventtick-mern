import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL,
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Instead of redirecting, just clear the token
            localStorage.removeItem('token');
            // Log the error for debugging
            console.log('Authentication error:', error.response?.data);
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials) => {
        try {
            console.log('Attempting login with credentials:', credentials);
            const response = await api.post('/login', credentials);
            console.log('Raw login response:', response);
            
            // Ensure we have the correct response structure
            if (!response.data || !response.data.token) {
                throw new Error('Invalid login response format');
            }
            
            // Store user data in localStorage
            const userData = {
                _id: response.data.userId || response.data._id,
                email: credentials.email,
                role: response.data.role || 'organizer'
            };
            
            console.log('Storing user data:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', response.data.token);
            
            return {
                success: true,
                data: {
                    token: response.data.token,
                    user: userData
                }
            };
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },
    register: async (userData) => {
        try {
            console.log('Attempting registration with data:', userData);
            const response = await api.post('/register', userData);
            console.log('Registration response:', response.data);
            
            // Store user data in localStorage after registration
            const newUserData = {
                _id: response.data.userId || response.data._id,
                email: userData.email,
                role: userData.role
            };
            
            console.log('Storing user data after registration:', newUserData);
            localStorage.setItem('user', JSON.stringify(newUserData));
            
            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const eventService = {
    getAllEvents: async () => {
        try {
            console.log('Making request to get all events...');
            const response = await api.get('/events');
            console.log('Events API response:', response);
            return response.data;
        } catch (error) {
            console.error('Error in getAllEvents:', {
                error,
                response: error.response,
                message: error.message,
                data: error.response?.data
            });
            throw error;
        }
    },
    getEventById: async (id) => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },
    createEvent: async (eventData) => {
        try {
            console.log('Starting event creation...');
            console.log('Event data received:', eventData);
            
            // Get the current user's ID from localStorage
            const storedUser = localStorage.getItem('user');
            console.log('Stored user data:', storedUser);
            
            if (!storedUser) {
                console.error('No user data found in localStorage');
                throw new Error('Please log in to create an event');
            }
            
            const user = JSON.parse(storedUser);
            console.log('Parsed user data:', user);
            
            if (!user || !user._id) {
                console.error('Invalid user data:', user);
                throw new Error('Invalid user data. Please log in again.');
            }
            
            // Format the event data
            const formattedEventData = {
                ...eventData,
                organizer: user._id,
                status: 'pending',
                availableTickets: parseInt(eventData.totalTickets) // Ensure it's a number
            };
            
            console.log('Sending formatted event data:', formattedEventData);
            const response = await api.post('/events', formattedEventData);
            console.log('Create event response:', response.data);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create event');
            }
            
            return response.data;
        } catch (error) {
            console.error('Create event error:', {
                error,
                response: error.response,
                message: error.message,
                data: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },
    updateEvent: async (id, eventData) => {
        try {
            console.log('API: Updating event with ID:', id);
            console.log('API: Event data:', eventData);
            const response = await api.put(`/events/${id}`, eventData);
            console.log('API: Update response:', response);
            return response.data;
        } catch (error) {
            console.error('API: Update event error:', {
                error,
                response: error.response,
                message: error.message
            });
            throw error;
        }
    },
    deleteEvent: async (id) => {
        try {
            console.log('API: Deleting event with ID:', id);
            const response = await api.delete(`/events/${id}`);
            console.log('API: Delete response:', response);
            return response.data;
        } catch (error) {
            console.error('API: Delete event error:', {
                error,
                response: error.response,
                message: error.message
            });
            throw error;
        }
    },
    getEventAnalytics: async (id) => {
        const response = await api.get(`/events/${id}/analytics`);
        return response.data;
    },
    getOrganizerEvents: async () => {
        const response = await api.get('/events/organizer');
        return response.data;
    }
};

export default api; 