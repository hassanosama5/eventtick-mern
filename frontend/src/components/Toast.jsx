import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#1976d2';

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: bgColor,
      color: '#fff',
      padding: '1rem 2rem',
      borderRadius: 4,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 9999
    }}>
      {message}
    </div>
  );
};

export default Toast; 