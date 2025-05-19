import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ButtonGroup,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const UpdateUserRoleModal = ({ open, onClose, user, onUpdateRoleConfirm }) => {
  const [selectedRole, setSelectedRole] = useState('standard');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleConfirm = () => {
    onUpdateRoleConfirm(user._id, selectedRole);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="update-role-modal-title"
      aria-describedby="update-role-modal-description"
    >
      <Box sx={style}>
        <Typography id="update-role-modal-title" variant="h6" component="h2">
          Update User Role
        </Typography>
        {user && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">{`User: ${user.name} (${user.email})`}</Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="select-role-label">Role</InputLabel>
              <Select
                labelId="select-role-label"
                id="select-role"
                value={selectedRole}
                label="Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="organizer">Organizer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirm}>Update</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateUserRoleModal; 