"use client";

import { useState, useEffect } from "react";
import { FiLink, FiX } from "react-icons/fi";
import CastImportForm from "../bookmark/CastImportForm";
import { useUser } from "@/context/UserContext";

export default function QuickCastmarkButton() {
  const { isAuthenticated, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only show button after component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleSuccess = () => {
    // Close the modal after a short delay to show success state
    setTimeout(() => {
      setIsOpen(false);
    }, 1500);
  };

  // Don't render anything during SSR or if not authenticated
  if (!mounted || loading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <button
        onClick={toggleModal}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-purple-500 text-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all border-4 border-black hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
        aria-label="Quick save cast"
      >
        <FiLink size={20} />
        <span>Quick Castmark</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={toggleModal}
              className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
            <div className="w-full">
              <CastImportForm onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
