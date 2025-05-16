"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import { FiCreditCard } from "react-icons/fi";

export default function WalletConnectButton() {
  return (
    <div className="wallet-connect-container">
      <Wallet className="z-20">
        <ConnectWallet>
          <button className="relative flex items-center gap-2 px-5 py-2 bg-indigo-500 text-white font-bold rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
            <FiCreditCard className="text-lg" />
            <span>Connect Wallet</span>
          </button>
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
