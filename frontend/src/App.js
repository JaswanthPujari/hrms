import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { isTokenExpired, logoutUser } from './lib/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // Check if token exists and is not expired
    if (token && userData) {
      if (isTokenExpired(token)) {
        // Token is expired, log out user (logoutUser handles clearing and redirect)
        setUser(null);
        logoutUser();
      } else {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);

    // Set up periodic token expiration check (every 60 seconds)
    const tokenCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && isTokenExpired(currentToken)) {
        // Token expired, log out user
        setUser(null);
        logoutUser();
      }
    }, 60000); // Check every 60 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              !user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} />
              )
            }
          />
          <Route
            path="/admin/*"
            element={
              user && user.role === 'admin' ? (
                <AdminDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/employee/*"
            element={
              user && user.role === 'employee' ? (
                <EmployeeDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={
              <Navigate
                to={
                  user
                    ? user.role === 'admin'
                      ? '/admin'
                      : '/employee'
                    : '/login'
                }
              />
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
