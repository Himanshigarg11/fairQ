import React, { createContext, useState, useEffect, useContext } from "react";
import { registerUser, loginUser, getProfile } from "../services/authService";
import { registerForPushNotifications } from "../services/notificationService";
import { socket } from "../socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("fairq_token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("joinRoom", user._id);
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("fairq_token");
      const savedUser = localStorage.getItem("fairq_user");

      if (savedToken && savedUser) {
        try {
          const profileData = await getProfile();
          setUser(profileData.data.user);
          setToken(savedToken);
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem("fairq_token");
          localStorage.removeItem("fairq_user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await registerUser(userData);
      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("fairq_token", token);
      localStorage.setItem("fairq_user", JSON.stringify(user));
      registerForPushNotifications(token);

      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loginUser(credentials);
      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("fairq_token", token);
      localStorage.setItem("fairq_user", JSON.stringify(user));
      registerForPushNotifications(token);

      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    socket.disconnect();
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("fairq_token");
    localStorage.removeItem("fairq_user");
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
