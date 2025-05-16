"use client";

import { FiCreditCard } from "react-icons/fi";

export default function WalletConnectButton() {
  return (
    <button
      className="relative flex items-center gap-2 px-5 py-2 bg-indigo-500 text-white font-bold rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
      onClick={() => {
        alert(
          "Wallet connection is temporarily disabled. Please check back soon!",
        );
      }}
    >
      <FiCreditCard className="text-lg" />
      <span>Connect Wallet</span>
    </button>
  );
}
