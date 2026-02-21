import type { PropsWithChildren, ReactElement } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: PropsWithChildren): ReactElement {
  const token = localStorage.getItem("token");
  return token ? (children as ReactElement) : <Navigate to="/login" replace />;
}
