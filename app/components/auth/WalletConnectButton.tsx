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
import { FiCreditCard, FiUser } from "react-icons/fi";
import { useWalletClient } from "wagmi";

export default function WalletConnectButton() {
  const { data: walletClient } = useWalletClient();
  const isConnected = !!walletClient;

  return (
    <div className="wallet-connect-container">
      <Wallet className="z-20">
        <ConnectWallet>
          {!isConnected ? (
            <button className="relative flex items-center gap-2 px-5 py-2 bg-indigo-500 text-white font-bold rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
              <FiCreditCard className="text-lg" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white font-bold rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <FiUser className="text-lg" />
              <Name className="text-inherit" />
            </div>
          )}
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
}
