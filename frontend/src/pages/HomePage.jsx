import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css"; // We'll create this next

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Amazing Events</h1>
          <p>
            Find and book tickets for your favorite concerts, sports, and
            cultural events
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to="/register" className="btn primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn secondary">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to="/events" className="btn primary">
                Browse Events
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="icon">🎟️</div>
          <h3>Easy Booking</h3>
          <p>Secure your tickets in just a few clicks</p>
        </div>
        <div className="feature-card">
          <div className="icon">📅</div>
          <h3>Never Miss Out</h3>
          <p>Get reminders for your booked events</p>
        </div>
        <div className="feature-card">
          <div className="icon">💰</div>
          <h3>Best Prices</h3>
          <p>Competitive pricing with no hidden fees</p>
        </div>
      </section>

      {!user && (
        <section className="cta">
          <h2>Ready to explore events?</h2>
          <Link to="/register" className="btn primary">
            Create Free Account
          </Link>
        </section>
      )}
    </div>
  );
}
