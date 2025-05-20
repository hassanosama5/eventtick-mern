import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  const {
    _id,
    title,
    date,
    location,
    ticketPrice,
    imageUrl,
    category
  } = event;

  return (
    <Link to={`/events/${_id}`} style={{ textDecoration: 'none' }}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 3
          }
        }}
      >
        <Box
          sx={{
            height: 200,
            backgroundImage: `url(${imageUrl || '/default-event.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {format(new Date(date), 'PPP')}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📍 {location}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="h6" color="primary">
              ${ticketPrice}
            </Typography>
            <Chip 
              label={category} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard; 