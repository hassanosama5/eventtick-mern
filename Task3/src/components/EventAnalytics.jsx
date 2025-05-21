import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventService } from '../services/api';
import EventAnalyticsChart from './EventAnalyticsChart';

const EventAnalytics = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await eventService.getEventAnalytics(id);
        if (response.success) {
          setEvent(response.data.event);
          setAnalytics(response.data.analytics);
        } else {
          setError(response.message || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Event Analytics</h2>
      <EventAnalyticsChart event={event} analytics={analytics} />
    </div>
  );
};

export default EventAnalytics;