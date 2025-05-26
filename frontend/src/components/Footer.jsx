import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-section">
        <h2>Quick Links</h2>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h2>Legal</h2>
        <ul>
          <li>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/terms-of-service">Terms of Service</Link>
          </li>
        </ul>
      </div>
      <div className="footer-section">
        <h2>Contact Us</h2>
        <p>Email: support@eventplatform.com</p>
        <p>Phone: (555) 123-4567</p>
      </div>
    </div>
  </footer>
);

export default Footer;
