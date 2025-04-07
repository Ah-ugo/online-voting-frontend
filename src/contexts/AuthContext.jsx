"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = "https://online-voting-br3j.onrender.com";

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [API_URL]);

  const login = async (matricNumber, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append("grant_type", "password");
      formData.append("username", matricNumber);
      formData.append("password", password);
      // You might need to include scope, client_id, and client_secret
      // depending on your backend's OAuth 2.0 configuration.
      // formData.append("scope", "");
      // formData.append("client_id", "");
      // formData.append("client_secret", "");

      const response = await axios.post(
        `${API_URL}/auth/login`,
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json", // It's good practice to specify the expected response type
          },
        }
      );

      const { access_token, ...userData } = response.data; // Assuming your backend returns access_token
      localStorage.setItem("token", access_token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const formData = new FormData();

      // Add all user data to formData
      Object.keys(userData).forEach((key) => {
        if (key === "profileImage" && userData[key] instanceof File) {
          formData.append(key, userData[key]);
        } else {
          formData.append(key, userData[key]);
        }
      });

      const response = await axios.post(`${API_URL}/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful! Please login.");
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Add all user data to formData
      Object.keys(userData).forEach((key) => {
        if (key === "profileImage" && userData[key] instanceof File) {
          formData.append(key, userData[key]);
        } else if (userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const response = await axios.put(`${API_URL}/users/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      toast.success("Profile updated successfully");
      return response.data;
    } catch (error) {
      console.error("Profile update failed:", error);
      const message = error.response?.data?.message || "Profile update failed";
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
