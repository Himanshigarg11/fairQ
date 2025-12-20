import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, LogOut, User, LogIn, UserPlus } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white/70 backdrop-blur-xl shadow-md sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs tracking-tight">
                  FQ
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent hover:from-orange-700 hover:to-orange-800 transition-all duration-300 tracking-tight">
                FairQ
              </h1>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* User Info */}
                <div className="flex items-center space-x-2 bg-orange-50/90 px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
                  <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {user.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-xs sm:text-sm text-slate-700 font-medium">
                    Welcome, {user.firstName}!
                  </span>
                  <span className="sm:hidden text-xs text-slate-700 font-medium">
                    {user.firstName}
                  </span>
                </div>

                {/* Dashboard Button */}
                <Link
                  to={`/${user.role.toLowerCase()}/dashboard`}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-3 sm:px-4 py-1.5 rounded-full hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-xs sm:text-sm font-medium"
                >
                  <LayoutDashboard size={16} className="hidden sm:block" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">📊</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 bg-slate-800 text-white px-3 sm:px-4 py-1.5 rounded-full hover:bg-black transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-xs sm:text-sm font-medium"
                >
                  <LogOut size={16} className="hidden sm:block" />
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-orange-600 transition-colors font-medium text-xs sm:text-sm"
                >
                  <LogIn size={15} className="hidden sm:block" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 sm:px-5 py-1.5 rounded-full hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-xs sm:text-sm font-medium"
                >
                  <UserPlus size={16} className="hidden sm:block" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
