import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface UserRouteProps {
  children: React.ReactNode;
}

interface DecodedToken {
  role: string;
  [key: string]: any;
}

export default function UserRoute({ children }: UserRouteProps) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.role !== "user") return <Navigate to="/dashboard" replace />;
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
