import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Components
import EventList from './components/events/EventList';
import EventDetails from './components/events/EventDetails';

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
        <Routes>
          {/* Event Routes */}
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetails />} />
          
          {/* Redirect root to events page */}
          <Route path="/" element={<EventList />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 