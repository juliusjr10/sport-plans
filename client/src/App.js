import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage'; // Import RegisterPage
import PlansPage from './PlansPage';
import WorkoutsPage from './WorkoutsPage';
import AddPlanPage from './AddPlanPage';
import ExercisesPage from './ExercisesPage';  // Import the ExercisesPage component
import { Navbar } from './Navbar';  // Import the Navbar component

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const isLoggedIn = Boolean(localStorage.getItem('authToken')); // Check if the user is logged in

  // If user is not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  // If logged in, render the requested page
  return children;
};

function App() {
  return (
    <Router>
      {/* Navbar will be displayed on every page */}
      <Navbar />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Add Register Page route */}

        {/* Protected routes */}
        <Route 
          path="/plans" 
          element={
            <PrivateRoute>
              <PlansPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/plans/:plan_id/workouts" 
          element={
            <PrivateRoute>
              <WorkoutsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/plans/new" 
          element={
            <PrivateRoute>
              <AddPlanPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/workouts/:workout_id/exercises" 
          element={
            <PrivateRoute>
              <ExercisesPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
