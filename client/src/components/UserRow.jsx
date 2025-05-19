import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const UserRow = ({ user, index, onUpdateRole, onDeleteUser }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setSelectedRole(newRole);
    onUpdateRole(user._id, newRole);
  };

  const handleDeleteClick = () => {
    onDeleteUser(user._id);
  };

  // Function to get row background color based on role using the provided palette
  const getRoleBackgroundColor = (role, index) => {
    switch (role) {
      case 'admin':
        return '#308695'; // Teal from palette
      case 'organizer':
        return '#E69D45'; // Orange from palette
      case 'standard':
        // Alternating light grey and white for standard users
        return index % 2 === 0 ? '#D4CFC9' : '#ffffff'; 
      default:
        // Default to alternating light grey and white
        return index % 2 === 0 ? '#D4CFC9' : '#ffffff'; 
    }
  };

  // Styling for row including conditional background and hover effect
  const rowSx = {
    backgroundColor: getRoleBackgroundColor(user.role, index),
    '&:hover': { 
        backgroundColor: getRoleBackgroundColor(user.role, index) === (index % 2 === 0 ? '#D4CFC9' : '#ffffff') // Check if it's a standard row color
            ? '#f0f0f0' // Subtle hover for standard rows
            : getRoleBackgroundColor(user.role, index), // Keep role color on hover for admin/organizer
    }, 
  };

  return (
    <TableRow key={user._id} sx={rowSx}>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <FormControl variant="outlined" size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            label="Role"
          >
            <MenuItem value="standard">Standard</MenuItem>
            <MenuItem value="organizer">Organizer</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <Box display="flex">
          {/* Update Role is handled by the Select dropdown */}
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={handleDeleteClick}
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default UserRow; 