// components/collection/CollectionAttestation.tsx
import { Transaction, TransactionButton, TransactionStatus } from '@coinbase/onchainkit/transaction';
import { Collection } from '@/lib/supabase';

const ATTESTATION_CONTRACT = '0x1234...'; // Replace with actual contract address
const ATTESTATION_ABI = [...]; // Add appropriate ABI

interface CollectionAttestationProps {
  collection: Collection;
}

export function CollectionAttestation({ collection }: CollectionAttestationProps) {
  return (
    <Transaction
      contracts={[{
        address: ATTESTATION_CONTRACT,
        abi: ATTESTATION_ABI,
        functionName: 'attestCollection',
        args: [
          collection.id,
          collection.name,
          collection.description || '',
          new Date(collection.created_at).getTime() / 1000
        ]
      }]}
    >
      <div className="mt-4 border border-purple-200 rounded-lg p-4 bg-purple-50">
        <h3 className="text-sm font-medium text-purple-800 mb-2">Make this collection verifiable on-chain</h3>
        <p className="text-xs text-purple-600 mb-3">
          Create an on-chain record of this collection to verify your curation work and make it discoverable to others.
        </p>
        <TransactionButton 
          text="Create On-chain Record" 
          className="bg-purple-600 text-white text-sm rounded-md px-3 py-1 hover:bg-purple-700"
        />
        <TransactionStatus />
      </div>
    </Transaction>
  );
}