import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then(res => setEvents(res.data))
      .catch(err => setError(err.response?.data?.error || 'Error fetching events'));
  }, []);

  return (
    <div className="event-list">
      <h2>Events</h2>
      {error && <div className="error">{error}</div>}
      <ul>
        {events.map(event => (
          <li key={event._id} className="event-item">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
            <p>Location: {event.location}</p>
            <p>Category: {event.category}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList; 