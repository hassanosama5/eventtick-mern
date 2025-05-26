import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import UserRow from './UserRow';
import UpdateUserRoleModal from './UpdateUserRoleModal'; // Import modal
import ConfirmationDialog from './ConfirmationDialog'; // Import dialog

const API_BASE_URL = `${import.meta.env.REACT_APP_API_BASE_URL}/api/v1/`;

// *** Replace with your actual admin token for testing ***
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmIwZmU3NzczMjNmZTE5ODY3NjY0ZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzY1MjU4MywiZXhwIjoxNzUwMjQ0NTgzfQ.e_N_BcNG97eqvxNfEvpSiPpFuj9T2K6tOtyClCqcHiw';

// ******************************************************

const AdminUsersPage = () => {
  console.log('AdminUsersPage component rendering');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openRoleModal, setOpenRoleModal] = useState(false); // State for role modal
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete dialog
  const [selectedUser, setSelectedUser] = useState(null); // State to hold user for modal/dialog

  useEffect(() => {
    console.log('AdminUsersPage useEffect running');
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    console.log('fetchUsers function called');
    try {
      const response = await axios.get(`${API_BASE_URL}admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || AUTH_TOKEN}`,
        },
      });
      setUsers(response.data.data); // Assuming the backend returns data in response.data.data
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
      console.error('Error fetching users:', err);
    }
  };

  // Open role update modal
  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setOpenRoleModal(true);
  };

  // Close role update modal
  const handleCloseRoleModal = () => {
    setOpenRoleModal(false);
    setSelectedUser(null);
  };

  // Handle role update confirmation from modal
  const handleUpdateRoleConfirm = async (userId, newRole) => {
    console.log(`Confirming update role for user ${userId} to ${newRole}`);
    try {
        await axios.put(`${API_BASE_URL}admin/users/${userId}`, { role: newRole }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token') || AUTH_TOKEN}`,
            },
        });
        fetchUsers(); // Refresh list after update
    } catch (err) {
        console.error('Error updating user role:', err);
        setError('Failed to update user role');
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  // Handle delete confirmation from dialog
  const handleDeleteUserConfirm = async () => {
    if (!selectedUser) return; // Should not happen if dialog is opened correctly
    console.log(`Confirming delete for user ${selectedUser._id}`);
    try {
        await axios.delete(`${API_BASE_URL}admin/users/${selectedUser._id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token') || AUTH_TOKEN}`,
            },
        });
        fetchUsers(); // Refresh list after deletion
        handleCloseDeleteDialog(); // Close dialog after successful deletion
    } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#333', textAlign: 'center' }}>
        Admin Users Management
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#e0e0e0' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <UserRow 
                key={user._id} 
                user={user} 
                index={index}
                onUpdateRole={() => handleOpenRoleModal(user)} // Open modal instead of direct update
                onDeleteUser={() => handleOpenDeleteDialog(user)} // Open dialog instead of direct delete
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals and Dialogs */}
      <UpdateUserRoleModal
        open={openRoleModal}
        onClose={handleCloseRoleModal}
        user={selectedUser}
        onUpdateRoleConfirm={handleUpdateRoleConfirm} // Pass the confirm handler
      />

      <ConfirmationDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteUserConfirm} // Pass the confirm handler
        title="Confirm Deletion"
        message={`Are you sure you want to delete user ${selectedUser?.name}?`}
      />

    </Box>
  );
};

export default AdminUsersPage; 