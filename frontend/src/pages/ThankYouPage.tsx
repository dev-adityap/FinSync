import React from "react";
import { Link } from "react-router-dom";

export const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] text-[var(--text-primary)] p-6">
      <h1 className="text-3xl font-bold">Thank you</h1>
      <p className="mt-2 text-[#6B7280]">Your submission was received.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/app" className="rounded-full bg-[#111111] text-white px-4 py-2 text-sm">Go to Dashboard</Link>
        <Link to="/app/reconcile/new" className="rounded-full border border-[#EAECEF] px-4 py-2 text-sm">Start Another Reconciliation</Link>
        <Link to="/" className="rounded-full border border-[#EAECEF] px-4 py-2 text-sm">Back to Home</Link>
      </div>
    </div>
  );
};
export default ThankYouPage;

