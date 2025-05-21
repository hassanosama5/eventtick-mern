import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventService } from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './EventAnalytics.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const EventAnalytics = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [id]);

    const fetchAnalytics = async () => {
        try {
            const response = await eventService.getEventAnalytics(id);
            if (response.success) {
                setAnalytics(response.data);
            }
        } catch (err) {
            setError('Failed to fetch event analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading analytics...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!analytics) return <div className="error">No analytics data available</div>;

    // Prepare data for the booking trend chart
    const bookingTrendData = {
        labels: analytics.bookingTrend.map(item => item.date),
        datasets: [
            {
                label: 'Number of Bookings',
                data: analytics.bookingTrend.map(item => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for the ticket type distribution chart
    const ticketDistributionData = {
        labels: analytics.ticketDistribution.map(item => item.type),
        datasets: [
            {
                data: analytics.ticketDistribution.map(item => item.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="analytics-container">
            <h2>Event Analytics</h2>
            
            <div className="analytics-summary">
                <div className="summary-card">
                    <h3>Total Bookings</h3>
                    <p>{analytics.totalBookings}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Revenue</h3>
                    <p>${analytics.totalRevenue}</p>
                </div>
                <div className="summary-card">
                    <h3>Average Ticket Price</h3>
                    <p>${analytics.averageTicketPrice}</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-card">
                    <h3>Booking Trend</h3>
                    <Bar
                        data={bookingTrendData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Daily Booking Trend',
                                },
                            },
                        }}
                    />
                </div>

                <div className="chart-card">
                    <h3>Ticket Type Distribution</h3>
                    <Pie
                        data={ticketDistributionData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Ticket Type Distribution',
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventAnalytics; 