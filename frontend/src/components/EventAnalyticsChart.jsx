import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const EventAnalyticsChart = ({ event, analytics }) => {
  if (!event || !analytics) return <div>No analytics data available.</div>;

  const booked = analytics.bookedTickets;
  const available = analytics.availableTickets;

  const data = {
    labels: ['Booked', 'Available'],
    datasets: [
      {
        data: [booked, available],
        backgroundColor: ['#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Ticket Booking for "${event.title}"` },
    },
  };

  return <Pie data={data} options={options} />;
};

export default EventAnalyticsChart;