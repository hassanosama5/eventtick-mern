import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const Loader = ({ size = 40, fullScreen = false }) => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: fullScreen ? '100vh' : '100px',
    width: '100%',
  };

  return (
    <Box sx={containerStyle}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default Loader; 