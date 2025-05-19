import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Events from './components/Events';
import AdminUsersPage from './components/AdminUsersPage';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container>
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
