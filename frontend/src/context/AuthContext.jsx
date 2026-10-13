import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and load user profile if token is available
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setRestaurant(data.restaurant);
        } else {
          // Token is invalid/expired
          logout();
        }
      } catch (error) {
        console.error('Error fetching auth state:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Log in
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({ _id: data._id, name: data.name, email: data.email });
        setRestaurant(data.restaurant);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Server error. Please try again later.' };
    }
  };

  // Sign up
  const register = async (name, email, password, restaurantName) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, restaurantName }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({ _id: data._id, name: data.name, email: data.email });
        setRestaurant(data.restaurant);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Server error. Please try again later.' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRestaurant(null);
  };

  // Helper to update restaurant info locally after Profile edits
  const updateLocalRestaurant = (updatedRestaurant) => {
    setRestaurant(updatedRestaurant);
  };

  const value = {
    user,
    token,
    restaurant,
    loading,
    login,
    register,
    logout,
    updateLocalRestaurant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
