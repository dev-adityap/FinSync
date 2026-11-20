import React from "react";
import { Link, useLocation } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] text-[var(--text-primary)] p-6">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-[#6B7280]">Page not found: {location.pathname}</p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="rounded-full bg-[#111111] text-white px-4 py-2 text-sm">Home</Link>
        <Link to="/app" className="rounded-full border border-[#EAECEF] px-4 py-2 text-sm">Workspace</Link>
      </div>
    </div>
  );
};
export default NotFoundPage;

