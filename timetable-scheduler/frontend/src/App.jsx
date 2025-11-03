import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Faculty from './pages/Faculty';
import Subjects from './pages/Subjects';
import Classrooms from './pages/Classrooms';
import Batches from './pages/Batches';
import TimeSlots from './pages/TimeSlots';
import TimetableGenerator from './pages/TimetableGenerator';
import Reports from './pages/Reports';

// **New pages**
import FacultySubjectAssignment from './pages/FacultySubjectAssignment';
import BatchSubjectAssignment from './pages/BatchSubjectAssignment';

import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/faculty" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Faculty />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/subjects" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Subjects />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/classrooms" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Classrooms />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/batches" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Batches />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/time-slots" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <TimeSlots />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/timetable-generator" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <TimetableGenerator />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/reports" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <Reports />
            </Layout>
          </PrivateRoute>
        } />

        {/* ====== NEW ROUTES ====== */}
        <Route path="/faculty-subject-assignment" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <FacultySubjectAssignment />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/batch-subject-assignment" element={
          <PrivateRoute>
            <Layout setIsAuthenticated={setIsAuthenticated}>
              <BatchSubjectAssignment />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
