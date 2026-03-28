import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Leaf, Settings, LogOut } from "lucide-react";
import { Button } from "./Button";
import API from "../services/api";
import CommunicationHub from "./CommunicationHub";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-hot-toast";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [authed, setAuthed] = useState<boolean>(() => !!localStorage.getItem("token"));
  const [user, setUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return undefined;
  }, [isProfileOpen]);

  useEffect(() => {
    const sync = () => {
      const token = localStorage.getItem("token");
      setAuthed(!!token && token !== "undefined" && token !== "null");

      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };

    sync(); // sync immediately on mount
    window.addEventListener("auth:changed", sync);
    window.addEventListener("storage", sync); // also sync across tabs

    return () => {
      window.removeEventListener("auth:changed", sync);
      window.removeEventListener("storage", sync);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // clear refresh cookie on backend (make this route)
      await API.post("/api/auth/logout");
      toast.success("Logged out successfully");
    } catch {
      toast.success("Logged out successfully");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/");
    }
  };

  const role = user?.role;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Contents", path: "/content" },

    ...(authed && role === "admin" ? [{ name: "Admin PV", path: "/admin" }] : []),

    { name: "Assessments", path: "/assessments" },
    { name: "Experts", path: "/experts" },
    { name: "Appointments", path: "/appointments" },
    ...(authed ? [{ name: "Dashboard", path: "/dashboard" }] : []),
  ];

  const linkBase = "no-underline text-sm font-medium transition-colors duration-200";

  return (
    <nav className="bg-[#FAF7F2] dark:bg-slate-900 border-b border-[#E8F0E9] dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="no-underline flex items-center gap-2">
            <div className="bg-[#7C9A82] dark:bg-emerald-600 p-2 rounded-full">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-[#2D3436] dark:text-white tracking-tight">
              SwasthyaManas
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${linkBase} ${
                    active ? "text-[#7C9A82] dark:text-emerald-400" : "text-[#2D3436] dark:text-white hover:text-[#7C9A82] dark:hover:text-emerald-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="flex items-center gap-3 pl-4 border-l border-[#E8F0E9] dark:border-slate-700">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-[#E8F0E9] dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "dark"
                  ? <Sun size={18} className="text-[#FAF7F2]" />
                  : <Moon size={18} className="text-[#2D3436]" />
                }
              </button>

              <div className="flex items-center gap-3">
                {/* Authenticated Section */}
                <div className={`flex items-center gap-3 transition-all duration-300 ${authed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none absolute'}`}>
                  {/* Communication Hub (Notifications + Inbox) */}
                  <CommunicationHub />

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#E8F0E9] dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-full bg-[#7C9A82] dark:bg-emerald-600 flex items-center justify-center text-white group-hover:shadow-md transition-shadow overflow-hidden">
                        {user?.profilePicture ? (
                          <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold">
                            {user?.firstName?.charAt(0).toUpperCase()}{user?.lastName?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-xs font-medium text-[#2D3436] dark:text-white">
                          {user?.firstName || user?.email?.split("@")[0] || "User"}
                        </p>
                        <p className="text-xs text-[#5A6062] dark:text-slate-400 capitalize">
                          {role || "user"}
                        </p>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border border-[#E8F0E9] dark:border-slate-700 bg-white dark:bg-slate-800 py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-[#E8F0E9] dark:border-slate-700">
                          <p className="text-sm font-medium text-[#2D3436] dark:text-white">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-[#5A6062] dark:text-slate-400">
                            {user?.email}
                          </p>
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-[#E8F0E9] dark:bg-slate-700 text-[#5A7A60] dark:text-emerald-300 capitalize font-medium">
                            {role || "user"}
                          </span>
                        </div>

                        {/* Menu Items */}
                        <Link
                          to="/settings"
                          className="no-underline flex items-center gap-3 px-4 py-2 text-sm text-[#2D3436] dark:text-white hover:bg-[#FAF7F2] dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings size={16} className="text-[#7C9A82] dark:text-emerald-400" />
                          <span>Settings</span>
                        </Link>

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-[#FAF7F2] dark:hover:bg-slate-700 transition-colors text-left border-t border-[#E8F0E9] dark:border-slate-700"
                        >
                          <LogOut size={16} />
                          <span>Log Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Unauthenticated Section */}
                <div className={`flex items-center gap-3 transition-all duration-300 ${authed ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 pointer-events-auto'}`}>
                  <Link to="/login" className="no-underline">
                    <Button variant="ghost" size="sm">
                      Log In
                      </Button>
                    </Link>
                    <Link to="/signup" className="no-underline">
                      <Button variant="primary" size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#2D3436] dark:text-white hover:text-[#7C9A82] dark:hover:text-emerald-400 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#FAF7F2] dark:bg-slate-800 border-t border-[#E8F0E9] dark:border-slate-700">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="no-underline block px-3 py-2 rounded-md text-base font-medium text-[#2D3436] dark:text-white hover:text-[#7C9A82] dark:hover:text-emerald-400 hover:bg-[#E8F0E9] dark:hover:bg-slate-700"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-[#E8F0E9] dark:border-slate-700 space-y-2">
              {authed ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium text-[#2D3436] dark:text-white">Communications</span>
                    <CommunicationHub />
                  </div>

                  {/* Mobile User Info */}
                  <div className="px-3 py-3 bg-[#FAF7F2] dark:bg-slate-800 rounded-lg border border-[#E8F0E9] dark:border-slate-700">
                    <p className="text-sm font-medium text-[#2D3436] dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-[#5A6062] dark:text-slate-400">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-[#E8F0E9] dark:bg-slate-700 text-[#5A7A60] dark:text-emerald-300 capitalize font-medium">
                      {role || "user"}
                    </span>
                  </div>

                  <Link to="/settings" className="no-underline flex items-center gap-2 px-3 py-2 text-[#2D3436] dark:text-white hover:bg-[#E8F0E9] dark:hover:bg-slate-700 rounded-md">
                    <Settings size={16} />
                    Settings
                  </Link>

                  <button onClick={handleLogout} className="w-full flex items-center gap-2 text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-[#FAF7F2] dark:hover:bg-slate-700 rounded-md">
                    <LogOut size={16} />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="no-underline block">
                    <Button variant="ghost" className="w-full justify-start">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" className="no-underline block">
                    <Button variant="primary" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Theme Toggle */}
            <div className="pt-3 mt-3 border-t border-[#E8F0E9] dark:border-slate-700">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-3 py-2 text-[#2D3436] dark:text-white hover:bg-[#E8F0E9] dark:hover:bg-slate-700 rounded-md text-sm font-medium"
              >
                {theme === "dark"
                  ? <><Sun size={16} className="text-yellow-500" /> Light Mode</>
                  : <><Moon size={16} className="text-slate-600" /> Dark Mode</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}