"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Identity,
  Avatar,
  Name,
  Address,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { FiCheck, FiCreditCard } from "react-icons/fi";

export default function WalletConnectButton() {
  const { isConnected } = useAccount() || {};

  return (
    <div className="wallet-connect-container">
      <Wallet className="z-10">
        <ConnectWallet>
          {/* When not connected - show connect button */}
          {!isConnected ? (
            <button className="flex items-center gap-2 px-5 py-2 bg-purple-400 text-black font-black rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
              <FiCreditCard className="text-lg" />
              Connect Wallet
            </button>
          ) : (
            <button className="flex items-center gap-2 px-5 py-2 bg-green-400 text-black font-black rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
              <FiCheck className="text-lg" />
              <span>Connected</span>
            </button>
          )}
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <div className="flex flex-col gap-2 p-2">
              <div className="flex items-center gap-2">
                <Avatar />
                <div>
                  <Name className="font-bold text-lg" />
                  <Address className="text-sm text-gray-600" />
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <EthBalance className="text-md font-bold" />
              </div>
            </div>
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
