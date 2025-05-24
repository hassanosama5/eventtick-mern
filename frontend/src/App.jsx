import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, Button } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useAuth } from "./context/AuthContext";

// Auth Context & Route Protection
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Navigation & Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth Pages
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ForgotPassword from "./components/auth/ForgotPassword";
import Unauthorized from "./components/Unauthorized";

// User Pages
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

// Event Components
import PublicEventList from "./components/events/EventList";
import PublicEventDetails from "./components/events/EventDetails";

// Organizer Components
import OrganizerEventList from "./components/organizer/EventList";
import EventForm from "./components/organizer/EventForm";
import EventAnalytics from "./components/organizer/EventAnalytics";

// Booking Components
import UserBookings from "./components/bookings/UserBookings";

// Admin Components
import AdminEvents from "./components/Events";
import AdminUsersPage from "./components/AdminUsersPage";

// About Components
import About from "./components/About";
import Contact from "./components/Contact";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";

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

function RoleBasedNavigation() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Box
      sx={{
        padding: "10px",
        background: "#f0f0f0",
        marginBottom: "20px",
        display: "flex",
        gap: "10px",
      }}
    >
      {/* Public Navigation */}
      <Button component={Link} to="/events" variant="text">
        Browse Events
      </Button>

      {/* User Navigation */}
      {isAuthenticated && (
        <>
          <Button component={Link} to="/my-bookings" variant="text">
            My Bookings
          </Button>
          <Button component={Link} to="/profile" variant="text">
            Profile
          </Button>
        </>
      )}

      {/* Organizer Navigation */}
      {user?.role === "organizer" && (
        <>
          <Button component={Link} to="/organizer/events" variant="text">
            My Events
          </Button>
          <Button component={Link} to="/organizer/events/create" variant="text">
            Create Event
          </Button>
        </>
      )}

      {/* Admin Navigation */}
      {user?.role === "admin" && (
        <>
          <Button component={Link} to="/admin/events" variant="text">
            Manage Events
          </Button>
          <Button component={Link} to="/admin/users" variant="text">
            Manage Users
          </Button>
        </>
      )}
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <RoleBasedNavigation />

        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/events" element={<PublicEventList />} />
            <Route path="/events/:id" element={<PublicEventDetails />} />

            {/* Authenticated User Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-bookings" element={<UserBookings />} />
            </Route>

            {/* Organizer Routes */}
            <Route
              element={<PrivateRoute allowedRoles={["organizer", "admin"]} />}
            >
              <Route
                path="/organizer/events"
                element={<OrganizerEventList />}
              />
              <Route path="/organizer/events/create" element={<EventForm />} />
              <Route
                path="/organizer/events/edit/:id"
                element={<EventForm isEdit={true} />}
              />
              <Route
                path="/organizer/events/:id/analytics"
                element={<EventAnalytics />}
              />
            </Route>

            {/* Admin-only Routes */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
