import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FQ</span>
              </div>
              <Link to="/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent hover:from-orange-700 hover:to-orange-800 transition-all duration-300">
                  FairQ
                </h1>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-full">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium hidden sm:inline">
                    Welcome, {user.firstName}!
                  </span>
                  <span className="text-gray-700 font-medium sm:hidden">
                    {user.firstName}
                  </span>
                </div>

                {/* Dashboard Button */}
                <Link
                  to={`/${user.role.toLowerCase()}/dashboard`}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 sm:px-6 py-2 rounded-full hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
                >
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">📊</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-2 rounded-full hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
