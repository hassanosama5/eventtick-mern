import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: '#363636', color: '#fff', padding: '2rem 0', marginTop: 'auto' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', padding: '0 2rem' }}>
      <div>
        <h2 style={{ fontWeight: 'bold' }}>Quick Links</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/" style={{ color: '#fff' }}>Home</Link></li>
          <li><Link to="/about" style={{ color: '#fff' }}>About</Link></li>
          <li><Link to="/contact" style={{ color: '#fff' }}>Contact</Link></li>
        </ul>
      </div>
      <div>
        <h2 style={{ fontWeight: 'bold' }}>Legal</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/privacy-policy" style={{ color: '#fff' }}>Privacy Policy</Link></li>
          <li><Link to="/terms-of-service" style={{ color: '#fff' }}>Terms of Service</Link></li>
        </ul>
      </div>
      <div>
        <h2 style={{ fontWeight: 'bold' }}>Contact Us</h2>
        <p>Email: support@eventplatform.com</p>
        <p>Phone: (555) 123-4567</p>
      </div>
    </div>
  </footer>
);

export default Footer; 