import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Leaf, User } from "lucide-react";
import { Button } from "./Button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    // close mobile menu when route changes
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const rawUser = localStorage.getItem("user");
  let user: any = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }
  const role = user?.role;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Contents", path: "/content" },

    ...(isAuthenticated && role === "admin"
      ? [{ name: "Admin PV", path: "/admin" }]
      : []),

    { name: "Assessments", path: "/assessments" },
    { name: "Experts", path: "/experts" },
    ...(isAuthenticated ? [{ name: "Dashboard", path: "/dashboard" }] : []),
  ];


  const linkBase =
    "no-underline text-sm font-medium transition-colors duration-200";

  return (
    <nav className="bg-[#FAF7F2] border-b border-[#E8F0E9] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Brand */}
          <Link to="/" className="no-underline flex items-center gap-2">
            <div className="bg-[#7C9A82] p-2 rounded-full">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-[#2D3436] tracking-tight">
              SwasthyaManas
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${linkBase} ${
                    active
                      ? "text-[#7C9A82]"
                      : "text-[#2D3436] hover:text-[#7C9A82]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/inbox"
                    className={`${linkBase} text-[#2D3436] hover:text-[#7C9A82]`}
                  >
                    Inbox
                  </Link>

                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Log Out
                  </Button>

                  <div className="h-8 w-8 rounded-full bg-[#C4B5A0] flex items-center justify-center text-white">
                    <User size={16} />
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#2D3436] hover:text-[#7C9A82] focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-t border-[#E8F0E9]">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="no-underline block px-3 py-2 rounded-md text-base font-medium text-[#2D3436] hover:text-[#7C9A82] hover:bg-[#E8F0E9]"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-[#E8F0E9] space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/inbox"
                    className="no-underline block px-3 py-2 text-[#2D3436]"
                  >
                    Inbox
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-[#2D3436]"
                  >
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
          </div>
        </div>
      )}
    </nav>
  );
}
