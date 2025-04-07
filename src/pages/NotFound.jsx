"use client";

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NotFound = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">404</h2>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <p className="text-gray-500 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link
            to={
              user
                ? user.role === "admin"
                  ? "/admin/dashboard"
                  : "/dashboard"
                : "/login"
            }
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go back to {user ? "Dashboard" : "Login"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
