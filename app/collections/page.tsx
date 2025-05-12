"use client";

import { useEffect, useState } from "react";
import { useMiniKit, useClose } from "@coinbase/onchainkit/minikit";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import CollectionsList from "@/components/collection/CollectionsList";
import CollectionForm from "@/components/collection/CollectionForm";

export default function CollectionsPage() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const close = useClose();
  const [showForm, setShowForm] = useState(false);

  // Initialize the frame
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      <header className="w-full max-w-3xl flex items-center p-2 border-b-4 border-black bg-white">
        <button
          onClick={() => window.history.back()}
          className="mr-2 p-2 rounded-lg border-4 border-black bg-white hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] transition-all text-xl"
          aria-label="Go back"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-black tracking-wide border-4 border-black rounded-lg px-3 py-1 bg-white shadow-[4px_4px_0_0_#000] w-full text-center">
          Your Collections
        </h1>
      </header>

      <div className="w-full max-w-3xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 mb-4">
          <span className="text-2xl font-black tracking-wide border-4 border-black rounded-lg px-3 py-1 bg-white shadow-[4px_4px_0_0_#000]">
            Your Collections
          </span>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center bg-purple-400 text-white px-5 py-2 border-4 border-black rounded-lg font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all gap-2 w-full sm:w-auto justify-center"
          >
            <FiPlus size={20} /> new collection
          </button>
        </div>
        <CollectionsList />
      </div>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={close}
          className="px-4 py-2 bg-white border-4 border-black rounded-lg text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
        >
          Close
        </button>
      </div>

      {showForm && (
        <CollectionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            window.location.reload();
          }}
        />
      )}
    </main>
  );
}
