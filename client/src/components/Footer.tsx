import { Leaf, Heart, Instagram, Twitter, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#2D3436] text-[#FAF7F2] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-6 w-6 text-[#7C9A82]" />
              <span className="font-serif text-xl font-bold">
                SwasthyaManas
              </span>
            </div>

            <p className="text-[#C4B5A0] text-sm leading-relaxed mb-6">
              Empowering your journey to mental wellness through accessible
              assessments, expert guidance, and a supportive community.
            </p>

            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-[#C4B5A0] hover:text-[#7C9A82] cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-[#C4B5A0] hover:text-[#7C9A82] cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 text-[#C4B5A0] hover:text-[#7C9A82] cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4 text-white">
              Platform
            </h3>
            <ul className="space-y-3 text-sm text-[#C4B5A0]">
              <li>
                <Link to="/assessments" className="hover:text-[#7C9A82] transition-colors">
                  Assessments
                </Link>
              </li>
              <li>
                <Link to="/experts" className="hover:text-[#7C9A82] transition-colors">
                  Find Experts
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#7C9A82] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#7C9A82] transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4 text-white">
              Resources
            </h3>
            <ul className="space-y-3 text-sm text-[#C4B5A0]">
              <li>
                <a href="#" className="hover:text-[#7C9A82] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#7C9A82] transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#7C9A82] transition-colors">
                  Crisis Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#7C9A82] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4 text-white">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-[#C4B5A0]">
              <li>support@swasthya.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Wellness Way</li>
              <li>San Francisco, CA 94103</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#4A5558] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} SwasthyaManas. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-[#7C9A82] fill-current" />
            <span>for mental wellness</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
