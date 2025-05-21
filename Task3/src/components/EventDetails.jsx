import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventService } from '../services/api';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventService.getEventById(id);
        if (response.success) {
          setEvent(response.data);
        } else {
          setError(response.message || 'Event not found');
        }
      } catch (err) {
        setError('Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div>No event found.</div>;

  return (
    <div className="event-details-container">
      <h1>{event.title}</h1>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Price:</strong> ${event.price}</p>
      <p><strong>Available Tickets:</strong> {event.availableTickets}</p>
      <p><strong>Total Tickets:</strong> {event.totalTickets}</p>
      <p><strong>Category:</strong> {event.category}</p>
      <p><strong>Status:</strong> {event.status}</p>
    </div>
  );
};

export default EventDetails;