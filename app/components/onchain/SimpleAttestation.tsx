// components/onchain/SimpleAttestation.tsx
import { useState } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { Identity, Avatar, Name } from "@coinbase/onchainkit/identity";
import { FiAward, FiCheck } from "react-icons/fi";
import { Collection } from "@/lib/supabase";

// A simple demo contract address and ABI
const DEMO_CONTRACT = "0x1234567890123456789012345678901234567890";
const DEMO_ABI = [
  {
    inputs: [
      { name: "collectionId", type: "string" },
      { name: "name", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
    name: "attestCollection",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function" as const,
  },
] as const;

interface SimpleAttestationProps {
  collection: Collection;
  creatorAddress?: `0x${string}`;
}

export default function SimpleAttestation({
  collection,
  creatorAddress,
}: SimpleAttestationProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTransactionSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <FiAward className="text-purple-600 mr-2" />
          <h3 className="font-medium text-purple-900">Verify Collection</h3>
        </div>

        {creatorAddress && (
          <div className="text-xs text-gray-500 flex items-center">
            Created by
            <Identity
              address={creatorAddress}
              className="inline-flex items-center ml-1"
            >
              <Avatar className="h-4 w-4 mr-1" />
              <Name className="text-xs" />
            </Identity>
          </div>
        )}
      </div>

      {showSuccess ? (
        <div className="mt-3 flex items-center text-green-600">
          <FiCheck className="mr-1" />
          <span className="text-sm">Verified on chain!</span>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-purple-700 mb-3">
            Create an onchain record of this collection to verify your curation
          </p>

          <Transaction
            contracts={[
              {
                address: DEMO_CONTRACT,
                abi: DEMO_ABI,
                functionName: "attestCollection",
                args: [
                  collection.id,
                  collection.name,
                  Math.floor(new Date(collection.created_at).getTime() / 1000),
                ],
              },
            ]}
            onSuccess={handleTransactionSuccess}
          >
            <TransactionButton
              text="Verify Onchain"
              className="w-full py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
            />
            <TransactionStatus />
          </Transaction>
        </div>
      )}
    </div>
  );
}
