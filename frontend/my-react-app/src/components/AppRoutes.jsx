import Login from '../pages/Login';
import Register from '../pages/Register';
import HomePage from '../pages/HomePage';
import TestEmails from '../pages/TestEmails';
import { ProtectedRoute } from '../components/ProtectedRoute';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
export function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test-emails" element={<TestEmails />} />
        
        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}
