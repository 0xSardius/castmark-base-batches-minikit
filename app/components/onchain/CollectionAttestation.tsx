// components/onchain/CollectionAttestation.tsx
import { useState } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { Collection } from "@/lib/supabase";
import { FiAward, FiInfo, FiAlertTriangle } from "react-icons/fi";

// This is a placeholder for the actual NFT contract that will be deployed
// For the hackathon demo, we'll use a simple ETH transfer to demonstrate Base integration
const DEMO_MODE = true;

interface CollectionAttestationProps {
  collection: Collection;
}

export default function CollectionAttestation({
  collection,
}: CollectionAttestationProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Create metadata URI (in production, you'd create and upload real metadata)
  const metadataURI = `ipfs://example/${collection.id}`;

  const handleComingSoonClick = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  return (
    <div className="mt-4 border-4 border-black rounded-lg p-4 bg-purple-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <FiAward className="text-purple-600 mr-2" size={20} />
          <h3 className="text-sm font-medium text-purple-800">
            Make this collection permanent on Base
          </h3>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-purple-600 transition-transform ${expanded ? "transform rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {expanded && (
        <div className="mt-3">
          <div className="flex items-start mb-3 p-3 bg-purple-100 rounded-lg">
            <FiInfo
              className="text-purple-600 mr-2 mt-0.5 flex-shrink-0"
              size={16}
            />
            <div className="text-xs text-purple-700">
              <p className="font-bold mb-1">
                Why make your collection permanent?
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create a permanent record of your curation on Base</li>
                <li>Showcase your collection as an NFT</li>
                <li>Share verifiable proof of your curation work</li>
                <li>One-time transaction, lifetime permanence</li>
              </ul>
            </div>
          </div>

          {DEMO_MODE && (
            <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-3 mb-3 text-sm">
              <div className="flex items-start">
                <FiAlertTriangle
                  className="text-yellow-700 mr-2 mt-0.5 flex-shrink-0"
                  size={16}
                />
                <div>
                  <p className="font-bold text-yellow-800">
                    Hackathon Demo Mode
                  </p>
                  <p className="text-yellow-800 mt-1">
                    NFT minting functionality is coming soon! For now, you can
                    demonstrate a Base transaction by sending a small amount of
                    ETH.
                  </p>
                </div>
              </div>
            </div>
          )}

          {DEMO_MODE ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleComingSoonClick}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all w-full"
              >
                {showComingSoon ? "Coming Soon!" : "Mint Collection NFT"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-purple-50 text-gray-500">
                    or try a demo transaction
                  </span>
                </div>
              </div>

              <Transaction
                calls={[
                  {
                    to: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
                    value: BigInt(100000), // Small amount of wei
                    data: "0x", // Empty data for a simple ETH transfer
                  },
                ]}
              >
                <TransactionButton
                  text="Send Demo Transaction on Base"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all w-full mt-2"
                />
                <div className="mt-2">
                  <TransactionStatus />
                </div>
              </Transaction>
            </div>
          ) : (
            <Transaction
              contracts={[
                {
                  address: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
                  abi: [],
                  functionName: "mintCollectionNFT",
                  args: [
                    collection.id,
                    collection.name,
                    collection.description || "",
                    metadataURI,
                  ],
                },
              ]}
            >
              <TransactionButton
                text="Mint on Base"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all w-full mt-2"
              />
              <div className="mt-2">
                <TransactionStatus />
              </div>
            </Transaction>
          )}
        </div>
      )}
    </div>
  );
}
