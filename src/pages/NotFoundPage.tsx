import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    if (user) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The page you're looking for doesn't exist or you don't have
            permission to access it.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          >
            {user ? "Go to Dashboard" : "Go to Login"}
          </Button>

          {user && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                If you believe this is an error:
              </p>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Logout & Try Again
              </Button>
            </div>
          )}

          <div className="pt-4">
            <Link
              to="/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
