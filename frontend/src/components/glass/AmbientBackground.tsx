import React from "react";

export const AmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Top-left blue radial light */}
      <div
        className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--ambient-left) 0%, transparent 70%)",
        }}
      />

      {/* Top-right violet radial light */}
      <div
        className="absolute -top-32 -right-36 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--ambient-right) 0%, transparent 70%)",
        }}
      />

      {/* Bottom ambient cyan glow */}
      <div
        className="absolute -bottom-48 left-1/2 h-[440px] w-[760px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--ambient-bottom) 0%, transparent 72%)",
        }}
      />
    </div>
  );
};