import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  ButtonGroup, 
  Button, 
  CardActions,
  IconButton,
  Tooltip,
  Skeleton,
  Grid
} from '@mui/material';
import { format } from 'date-fns';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ShareIcon from '@mui/icons-material/Share';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { eventService, BACKEND_BASE_URL } from "../../services/api";

const EventCard = ({ 
  event, 
  onApprove, 
  onDecline, 
  showActions, 
  onSave,
  onShare,
  loading = false,
  viewMode = 'grid'
}) => {
  console.log('EventCard received event prop:', event);
  const [isSaved, setIsSaved] = useState(false);
  
  // If loading is true or event is undefined, show skeleton
  if (loading || !event) {
    return <EventCardSkeleton />;
  }
  
  const {
    _id,
    title,
    date,
    location,
    price,
    image,
    category,
    status,
    capacity,
    attendees = [],
    description
  } = event;
  
  const finalImageUrl = image ? `${BACKEND_BASE_URL}${image.startsWith('/') ? image : '/' + image}` : '/default-event.jpg';
  
  // Add a cache-busting query parameter
  const cacheBustedImageUrl = finalImageUrl !== '/default-event.jpg' ? `${finalImageUrl}?v=${Date.now()}` : finalImageUrl;

  console.log('EventCard Final Image URL:', cacheBustedImageUrl);
  
  // Handle save/favorite toggle
  const handleSaveToggle = (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    setIsSaved(!isSaved);
    if (onSave) onSave(_id, !isSaved);
  };
  
  // Handle share button click
  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) onShare(_id, title);
  };

  // Handle approve/decline clicks without navigation
  const handleApprove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onApprove) onApprove(_id);
  };
  
  const handleDecline = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDecline) onDecline(_id);
  };

  // Calculate remaining capacity
  const remainingCapacity = capacity ? capacity - attendees.length : null;
  const availabilityStatus = remainingCapacity === null ? '' :
    remainingCapacity <= 5 ? 'Almost Full' :
    remainingCapacity === 0 ? 'Sold Out' : '';

  // Render logic based on viewMode
  if (viewMode === 'list') {
    console.log('EventCard List View Final Image URL:', cacheBustedImageUrl);
    return (
      <Link to={`/events/${_id}`} style={{ textDecoration: 'none' }}>
        <Card
          sx={{
            display: 'flex', // Use flexbox for horizontal layout
            marginBottom: 2, // Add some space between list items
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            },
            position: 'relative',
          }}
        >
          {/* Status indicator for admin views */}
          {status && status !== 'approved' && (
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              color={status === 'pending' ? "warning" : status === 'declined' ? "error" : "default"}
              size="small"
              sx={{
                position: 'absolute',
                left: 12,
                top: -10,
                zIndex: 1
              }}
            />
          )}

          {/* Image section */}
          <Box
            sx={{
              width: 200, // Fixed width for the image in list view
              height: 150, // Add explicit height
              flexShrink: 0, // Prevent image from shrinking
              position: 'relative',
              overflow: 'hidden', // Hide parts of the image that exceed the box dimensions
            }}
            style={{
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Use img tag instead of background-image */}
            <img 
              src={cacheBustedImageUrl} 
              alt={title || 'Event Image'} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // Cover the box while maintaining aspect ratio
                position: 'absolute', // Position absolutely within the relative parent Box
                top: 0,
                left: 0,
                zIndex: 0, // Ensure it's behind other content like the favorite button
              }}
            />

             {/* Save/Favorite button */}
            <IconButton
              onClick={handleSaveToggle}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                }
              }}
            >
              {isSaved ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          </Box>

          {/* Content section */}
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="div" gutterBottom>
              {title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {format(new Date(date), 'PPP')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {location}
              </Typography>
            </Box>
             {capacity && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleAltIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {capacity - attendees.length} spots left
                </Typography>
              </Box>
            )}

            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {description}
              </Typography>
            )}


            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                ${price === 0 ? 'Free' : price}
              </Typography>
               <Tooltip title="Share event">
                <IconButton onClick={handleShare} size="small">
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
             {/* Admin action buttons */}
            {showActions && status === 'pending' && (
              <ButtonGroup variant="contained" size="small" aria-label="event status actions" sx={{ mt: 2 }}>
                <Button color="success" onClick={handleApprove}>Approve</Button>
                <Button color="error" onClick={handleDecline}>Decline</Button>
              </ButtonGroup>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default grid view rendering (existing code)
  return (
    <Link to={`/events/${_id}`} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          },
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* Conditional badge for availability status */}
        {availabilityStatus && (
          <Chip
            label={availabilityStatus}
            color={remainingCapacity === 0 ? "error" : "warning"}
            size="small"
            sx={{
              position: 'absolute',
              right: 12,
              top: -10,
              zIndex: 1,
              fontWeight: 'bold'
            }}
          />
        )}
        
        {/* Status indicator for admin views */}
        {status && status !== 'approved' && (
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={status === 'pending' ? "warning" : status === 'declined' ? "error" : "default"}
            size="small"
            sx={{
              position: 'absolute',
              left: 12,
              top: -10,
              zIndex: 1
            }}
          />
        )}
        
        {/* Image with gradient overlay */}
        <Box
          sx={{
            height: 200,
            width: '100%', // Add explicit width
            display: 'flex',
            alignItems: 'flex-end',
            p: 2,
            position: 'relative',
            overflow: 'hidden', // Hide parts of the image that exceed the box dimensions
          }}
           style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Use img tag instead of background-image */}
           <img 
            src={cacheBustedImageUrl} 
            alt={title || 'Event Image'} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover', // Cover the box while maintaining aspect ratio
              position: 'absolute', // Position absolutely within the relative parent Box
              top: 0,
              left: 0,
              zIndex: 0, // Ensure it's behind other content like the favorite button
            }}
          />

          {/* Add gradient overlay using another Box or pseudo-element if needed */}
          {/* For now, the focus is just on getting the image to display */}

          {/* Save/Favorite button */}
          <IconButton 
            onClick={handleSaveToggle} 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              }
            }}
          >
            {isSaved ? (
              <FavoriteIcon color="error" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
          
          {/* Add category chip on the image */}
          <Chip 
            label={category} 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: 'primary.main',
              fontWeight: 'medium'
            }} 
          />
        </Box>
        
        <CardContent sx={{ pb: 1, flexGrow: 1 }}>
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {format(new Date(date), 'PPP')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {location}
            </Typography>
          </Box>
          
          {capacity && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleAltIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {capacity - attendees.length} spots left
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              ${price === 0 ? 'Free' : price}
            </Typography>
          </Box>
          
          {description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                mt: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {description}
            </Typography>
          )}
        </CardContent>
        
        <CardActions disableSpacing sx={{ justifyContent: showActions ? 'space-between' : 'flex-end', pt: 0 }}>
          {/* Admin action buttons */}
          {showActions && status === 'pending' && (
            <ButtonGroup variant="contained" size="small" aria-label="event status actions">
              <Button color="success" onClick={handleApprove}>Approve</Button>
              <Button color="error" onClick={handleDecline}>Decline</Button>
            </ButtonGroup>
          )}
          
          {/* Share button */}
          <Tooltip title="Share event">
            <IconButton onClick={handleShare} size="small">
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Link>
  );
};

// Skeleton loader for the card
const EventCardSkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={180} />
    <CardContent>
      <Skeleton width="80%" height={30} />
      <Skeleton width="60%" height={20} />
      <Skeleton width="40%" height={20} />
    </CardContent>
  </Card>
);

export default EventCard;