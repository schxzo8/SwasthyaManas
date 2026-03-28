import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F8] to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#7C9A82] mb-4">404</h1>
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-3">Page Not Found</h2>
          <p className="text-[#666] text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">Go to Home</Button>
          </Link>
          <Link to="/dashboard">
            <button className="w-full px-6 py-3 border-2 border-[#7C9A82] text-[#7C9A82] font-semibold rounded-xl hover:bg-[#EBF8F5] transition-colors">
              Go to Dashboard
            </button>
          </Link>
        </div>

        <div className="mt-12 text-[#999] text-sm">
          <p>Lost? Try:</p>
          <div className="flex gap-4 justify-center mt-3 flex-wrap">
            <Link to="/" className="text-[#7C9A82] hover:underline">
              Home
            </Link>
            <Link to="/assessments" className="text-[#7C9A82] hover:underline">
              Assessments
            </Link>
            <Link to="/experts" className="text-[#7C9A82] hover:underline">
              Find Experts
            </Link>
            <Link to="/content" className="text-[#7C9A82] hover:underline">
              Learn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
