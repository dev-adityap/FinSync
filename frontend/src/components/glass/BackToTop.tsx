import React, { useEffect, useState } from "react";

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-6 z-40 h-10 w-10 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-lg hover:bg-[#111111]/90 active:scale-95 transition-all"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
};
