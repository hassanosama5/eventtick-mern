import { useParams } from 'react-router-dom';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams();
  
  // Temporary mock data - replace with API call later
  const event = {
    id,
    title: `Event ${id}`,
    date: '2023-12-15',
    location: 'Convention Center',
    description: 'This is a sample event description',
    price: 99,
    imageUrl: '/default-event.jpg',
    ticketsTotal: 100,
    ticketsSold: 65
  };

  return (
    <div className="event-details-container">
      <img src={event.imageUrl} alt={event.title} className="event-image" />
      <div className="event-info">
        <h1>{event.title}</h1>
        <p className="event-meta">
          📅 {new Date(event.date).toLocaleString()} | 📍 {event.location}
        </p>
        <p className="event-description">{event.description}</p>
        <div className="ticket-info">
          <span>${event.price} per ticket</span>
          <span>🎟️ {event.ticketsTotal - event.ticketsSold} tickets left</span>
        </div>
        <button className="buy-button">Buy Tickets</button>
      </div>
    </div>
  );
}