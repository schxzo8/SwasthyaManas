import type { PropsWithChildren, ReactElement } from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({
  children,
}: PropsWithChildren): ReactElement {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (!token || !userRaw) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userRaw);
    return user.role === "admin"
      ? (children as ReactElement)
      : <Navigate to="/dashboard" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
