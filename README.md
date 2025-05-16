# Castmark - Farcaster Bookmark Manager

Castmark is a bookmark manager for Farcaster casts. Save, organize, and share your favorite casts from the Farcaster network.

## Features

- Save casts from Farcaster
- Organize casts into collections
- Add tags and notes to your bookmarks
- Share collections with others via Farcaster Frames
- Register collections on Base blockchain

## Base Integration

Castmark uses Base blockchain to register collections, providing:

1. **Verifiability**: Permanently register collections on-chain
2. **Attribution**: Connect collections to your wallet identity
3. **Interoperability**: Allow other applications to verify and reference your collections

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Smart Contract (after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_on_base

# App URL
NEXT_PUBLIC_URL=https://your-deployment-url.com
```

### 2. Database Migration

Add the following columns to your Supabase `collections` table:

- `is_registered` (boolean, default: false)
- `transaction_hash` (text, nullable)

### 3. Contract Deployment

The app expects a simple registry contract deployed on Base with a `registerCollection` function that takes the following parameters:

- `collectionId` (string): The ID of the collection
- `name` (string): The name of the collection
- `url` (string): The URL to the collection

The function should store the registration status and emit an event with the collection details.

After deploying your contract, add its address to your `.env.local` file:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_on_base
```

### 4. Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 5. Build and Deploy

```bash
# Build for production
npm run build

# Deploy (e.g., to Vercel)
vercel deploy
```

## How It Works

### Saving Casts

1. Paste a Farcaster cast URL or hash
2. Add optional tags and notes
3. Save to your bookmarks

### Creating Collections

1. Create a new collection with a name and description
2. Add bookmarks to your collection
3. Share your collection with others

### Registering on Base

1. Go to a collection detail page
2. Click "Register on Base"
3. Confirm the transaction in your wallet
4. Your collection is now permanently registered on Base blockchain

### Sharing with Frames

1. Go to a collection
2. Click "Share"
3. The collection is shared with a Farcaster Frame that others can interact with

## Technologies Used

- Next.js
- Supabase
- Base Blockchain
- Farcaster Frames
- Wagmi/Viem for blockchain interactions
