import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/events";

// Create axios instance configured for cookie-based auth
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Authentication error in event service");
    }
    return Promise.reject(error);
  }
);

export const eventService = {
  /**
   * Get all approved events (public)
   */
  //   getApprovedEvents: async () => {
  //     try {
  //       const response = await api.get('/approved');
  //       return response.data;
  //     } catch (error) {
  //       console.error('Error fetching approved events:', error);
  //       throw error;
  //     }
  //   },

  /**
   * Get event by ID (public)
   */
  getEventById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw error;
    }
  },

  /**
   * Create new event (organizer only)
   */
  createEvent: async (eventData) => {
    try {
      const response = await api.post("/", eventData);
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  /**
   * Update event (organizer/admin)
   */
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  /**
   * Delete event (organizer/admin)
   */
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  /**
   * Get event analytics (organizer only)
   */
  getEventAnalytics: async (id) => {
    try {
      const response = await api.get(`/${id}/analytics`);
      return response.data;
    } catch (error) {
      console.error("Error fetching event analytics:", error);
      throw error;
    }
  },

  /**
   * Get organizer's events (organizer only)
   */
  getOrganizerEvents: async () => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      console.error("Error fetching organizer events:", error);
      throw error;
    }
  },

  /**
   * Update event status (admin only)
   */
  updateEventStatus: async (id, status) => {
    try {
      const response = await api.patch(`/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating event status:", error);
      throw error;
    }
  },
};
