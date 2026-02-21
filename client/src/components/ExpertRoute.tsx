import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ExpertRouteProps {
  children: React.ReactNode;
}

interface DecodedToken {
  role: string;
  [key: string]: any;
}

export default function ExpertRoute({ children }: ExpertRouteProps) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.role !== "expert") return <Navigate to="/dashboard" replace />;
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
