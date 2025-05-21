import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Button } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Components
import EventList from './components/events/EventList';
import EventDetails from './components/events/EventDetails';
import UserBookings from './components/bookings/UserBookings';
import Events from './components/Events';
import AdminUsersPage from './components/AdminUsersPage';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Basic Navigation using Material-UI Buttons */}
        <Box sx={{
          padding: '10px',
          background: '#f0f0f0',
          marginBottom: '20px', // Add some space below the nav
          display: 'flex', // Use flexbox for layout
          gap: '10px' // Add space between buttons
        }} component="nav">
          <Button component={Link} to="/my-bookings" variant="text">My Bookings</Button>
          <Button component={Link} to="/events" variant="text">All Events</Button>
        </Box>

        <Routes>
          {/* Event Routes */}
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetails />} />

          {/* Booking Routes */}
          <Route path="/my-bookings" element={<UserBookings />} />
          
          {/* Redirect root to events page */}
          <Route path="/" element={<EventList />} />

          {/* Admin Event Management Route */}
          <Route path="/admin/events" element={<Events />} />

          {/* Admin Users Management Route */}
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 