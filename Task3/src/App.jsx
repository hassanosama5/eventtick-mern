import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import MyEventsPage from './components/MyEventsPage';
import EventAnalytics from './components/EventAnalytics';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Routes>
                        <Route path="/" element={<EventList />} />
                        <Route path="/events/create" element={<EventForm />} />
                        <Route path="/events/edit/:id" element={<EventForm isEdit={true} />} />
                        <Route path="/my-events" element={<MyEventsPage />} />
                        <Route path="/events/:id/analytics" element={<EventAnalytics />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
