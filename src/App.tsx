// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import Dashboard from './pages/Dashboard';
import CVPage from './pages/CVPage';
import InterviewPage from './pages/InterviewPage';
import JobsPage from './pages/JobsPage';
import NetworkPage from './pages/NetworkPage';
import CareerPage from './pages/CareerPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Layout from './components/Layout';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationPage';
import SettingsPage from './pages/SettingsPage';
import { ToastProvider } from './context/ToastContext';
import CreateJobPage from './pages/CreateJobPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import MyJobsPage from './pages/MyJobsPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import EditJobPage from './pages/EditJobPage';

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = authService.getCurrentUser();
  return currentUser ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

// Composant pour les routes publiques (quand déjà connecté)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = authService.getCurrentUser();
  return !currentUser ? <>{children}</> : <Navigate to="/" />;
};

const RoleRoute: React.FC<{ roles: Array<'candidate' | 'recruiter' | 'admin'>; children: React.ReactNode }> = ({ roles, children }) => {
  const currentUser = authService.getCurrentUser();
  return currentUser && roles.includes(currentUser.role) ? <Layout>{children}</Layout> : <Navigate to="/jobs" />;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
       } />

        {/* Routes protégées */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
      
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/chat/:userId" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
          } />
        <Route path="/cv" element={
          <ProtectedRoute>
            <CVPage />
          </ProtectedRoute>
        } />
        <Route path="/interview" element={
          <ProtectedRoute>
            <InterviewPage />
          </ProtectedRoute>
        } />
        <Route path="/jobs" element={
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        } />
        <Route path="/applications" element={
          <ProtectedRoute>
            <MyApplicationsPage />
          </ProtectedRoute>
        } />
        <Route path="/jobs/create" element={
          <RoleRoute roles={['recruiter','admin']}>
            <CreateJobPage />
          </RoleRoute>
        } />
        <Route path="/jobs/my" element={
          <RoleRoute roles={['recruiter','admin']}>
            <MyJobsPage />
          </RoleRoute>
        } />
        <Route path="/jobs/my/:jobId/applications" element={
          <RoleRoute roles={['recruiter','admin']}>
            <JobApplicationsPage />
          </RoleRoute>
        } />
        <Route path="/jobs/edit/:id" element={
          <RoleRoute roles={['recruiter','admin']}>
            <EditJobPage />
          </RoleRoute>
        } />
        <Route path="/network" element={
          <ProtectedRoute>
            <NetworkPage />
          </ProtectedRoute>
        } />
        <Route path="/career" element={
          <ProtectedRoute>
            <CareerPage />
          </ProtectedRoute>
        } />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;