import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, Button } from "@mui/material";
import { createTheme } from "@mui/material/styles";

// Auth Context & Route Protection
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Navigation & Layout
import Navbar from "./components/Navbar";

// Auth Pages
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ForgotPassword from "./components/auth/ForgotPassword";
import Unauthorized from "./components/Unauthorized";

// User Pages
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

// Event & Booking Pages
import EventList from "./components/events/EventList";
import EventDetails from "./components/events/EventDetails";
import UserBookings from "./components/bookings/UserBookings";

// Admin Pages
import Events from "./components/Events";
import AdminUsersPage from "./components/AdminUsersPage";

// Create MUI Theme
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />

        {/* Optional: Replace or merge with your Navbar */}
        <Box
          sx={{
            padding: "10px",
            background: "#f0f0f0",
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
          }}
        >
          <Button component={Link} to="/my-bookings" variant="text">
            My Bookings
          </Button>
          <Button component={Link} to="/events" variant="text">
            All Events
          </Button>
          <Button component={Link} to="/profile" variant="text">
            My Profile
          </Button>
        </Box>

        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetails />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-bookings" element={<UserBookings />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/events" element={<Events />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
