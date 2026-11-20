import React, { useState } from "react";

export const HelpFab: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-lg"
        aria-label="Help"
      >
        ?
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 z-40 w-72 bg-white border border-[#EAECEF] rounded-2xl shadow-xl p-4 space-y-2">
          <div className="text-sm font-semibold text-[#111111]">Quick Help</div>
          <div className="text-xs text-[#6B7280]">Tab: quick-fill empty fields</div>
          <div className="text-xs text-[#6B7280]">Ctrl+K: search</div>
          <button onClick={() => setOpen(false)} className="text-xs text-[#2563EB]">Close</button>
        </div>
      )}
    </>
  );
};
