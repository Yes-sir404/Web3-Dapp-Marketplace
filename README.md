## Web3 Digital Marketplace DApp

> A full‑stack Web3 marketplace for selling and buying digital products on **BlockDAG Testnet (BDAG)** – with IPFS storage, gas‑efficient smart contracts, and a modern React UI.

---

### ✨ Overview

This repository contains a **complete Web3 DApp**:

- **Smart contract**: A secure `Marketplace` contract for listing, updating, and purchasing digital products (software, ebooks, courses, templates, etc.).
- **Frontend**: A polished React + TypeScript + Vite SPA with dashboards for **sellers, buyers, and admins**.
- **Storage**: File uploads to **IPFS via Pinata**, including automatic thumbnail generation.
- **Network**: Deployed on **BlockDAG Testnet** using `hardhat` + `ethers v6`.

Users can:

- Connect their wallet with MetaMask
- List digital products with files stored on IPFS
- Browse trending assets and product details
- Purchase products and download them after successful on‑chain payment

---

### 🧱 Project Structure

- **Smart contracts**

  - `contracts/Marketplace.sol` – main marketplace contract
  - `hardhat.config.ts` – Hardhat + BlockDAG Testnet configuration
  - `scripts/deploy.ts` – deployment script
  - `scripts/updateABI.js` – syncs compiled ABI into the frontend

- **Frontend**
  - `frontend/src` – React + TypeScript app
  - `frontend/src/contracts/contractConfig.ts` – contract address, ABI and BDAG/Wei helpers
  - `frontend/src/hooks/useMarketplace.ts` – all contract calls (create, update, buy, fetch, stats)
  - `frontend/src/hooks/useWallet.ts` – MetaMask connection (account + signer)
  - `frontend/src/services/pinata.ts` – Pinata IPFS upload helpers
  - `frontend/src/components/pages` – main pages:
    - `DigitalProductListing.tsx` – seller listing UI
    - `DigitalMarketplace.tsx` – main marketplace browsing UI
    - `ProductDetails.tsx` – product detail + purchase flow
    - `SellerDashboard.tsx`, `BuyerDashboard.tsx`, `AdminDashboard.tsx`

---

### 🔐 Smart Contract – `Marketplace.sol`

The `Marketplace` contract (Solidity `0.8.20`) provides:

- **Product struct**

  - `uri` – IPFS URI of the main product file
  - `thumbnailUri` – IPFS URI for the preview image
  - `id`, `name`, `description`, `category`
  - `price` (in wei), `seller` (address), `salesCount`

- **Core functions**

  - `createProduct(...)` – list a new product (unlimited sales)
  - `updateProduct(...)` – update metadata and price
  - `updateProductMedia(...)` – update URIs (file/thumbnail)
  - `purchaseProduct(uint256 productId)` – purchase once per user

- **Security**

  - `ReentrancyGuard` – protects purchases
  - `Ownable` – admin/owner controls
  - `Pausable` – `pauseMarketplace`, `unpauseMarketplace`, `emergencyPause`
  - Price caps and string length validations

- **Fees & stats**
  - Marketplace fee in **parts per 10_000** (default 2.5%)
  - `withdrawFees()` for owner
  - Helpers to fetch stats and product lists

---

### 🖥️ Frontend UX Flow

- **1. Connect Wallet**

  - User clicks **Connect Wallet**
  - `useWallet` creates an `ethers.BrowserProvider` from `window.ethereum`
  - `useMarketplace` gets a contract instance via signer + ABI + `CONTRACT_ADDRESS`

- **2. List a Product (Seller)**

  - Fill in: **name, description, category, price (BDAG)**
  - Upload main file; optional thumbnail (or it is generated)
  - Files are uploaded to IPFS via **Pinata** → URIs returned
  - `useMarketplace.createProduct` converts BDAG → wei and calls `createProduct(...)`
  - UI shows **pending → success/error** status and clears the form on success

- **3. Browse & Purchase (Buyer)**

  - `DigitalMarketplace` loads products from `getAvailableProducts()`
  - Product cards show price, category, thumbnail, and other metadata
  - In **ProductDetails**, user confirms purchase
  - `purchaseProduct(productId, priceInWei)` is called with correct `value`
  - On success: the buyer is marked as purchased and can download the file

- **4. Admin & Dashboards**
  - **SellerDashboard** – manage own listings and stats
  - **BuyerDashboard** – view purchased items and access downloads
  - **AdminDashboard** – view marketplace stats, fees, and owner tools

---

### 🧩 Tech Stack

- **Blockchain / Backend**

  - Hardhat
  - Ethers v6
  - OpenZeppelin (`Ownable`, `Pausable`, `ReentrancyGuard`)
  - BlockDAG Testnet RPC (`https://rpc.awakening.bdagscan.com`, Chain ID `1043`)

- **Frontend**

  - React + TypeScript + Vite
  - Tailwind‑style utility classes (custom CSS)
  - Framer Motion (animations)
  - Lucide React (icons)

- **Storage**
  - IPFS via Pinata (JWT token)

---

### ⚙️ Prerequisites

- Node.js (LTS recommended)
- npm
- MetaMask browser extension
- A BlockDAG Testnet account with some **BDAG** (for gas)

---

### 🚀 Setup & Installation

#### 1. Clone the repo

```bash
git clone https://github.com/Yes-sir404/web3-marketplace-dapp.git
cd web3-marketplace-dapp
```

#### 2. Install dependencies

```bash
# Root (Hardhat / backend)
npm install

# Frontend
cd frontend
npm install
cd ..
```

#### 3. Environment variables

Create **`.env`** in the project root:

```bash
BLOCKDAG_RPC_URL=https://rpc.awakening.bdagscan.com
PRIVATE_KEY=your_deployer_private_key_here
```

Create **`frontend/.env`**:

```bash
VITE_PINATA_JWT=your_pinata_jwt_token_here
```

> **Note:** Never commit real private keys or JWT tokens to Git.

---

### 📦 Compile & Deploy Contracts

#### Compile and update ABI

```bash
npm run compile
```

This runs:

- `hardhat compile`
- `node scripts/updateABI.js` → writes `frontend/src/ABI.ts`

#### Deploy to BlockDAG Testnet

```bash
npx hardhat run scripts/deploy.ts --network blockdagTestnet
```

The script will print the **deployed contract address**.  
Update `frontend/src/contracts/contractConfig.ts`:

```ts
export const CONTRACT_ADDRESS = "0x...your_new_address...";
```

Then rebuild the frontend (see below).

---

### 🌐 Frontend – Development & Build

#### Run in development mode

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` and connect MetaMask (BlockDAG Testnet).

#### Build for production

```bash
cd frontend
npm run build
```

The static site is generated in `frontend/dist/` and can be deployed to:

- Netlify / Vercel / Cloudflare Pages
- Any static hosting (S3 + CloudFront, Nginx, etc.)

---

### 🧪 Useful Hardhat Commands

- **Run a local node**

```bash
npx hardhat node
```

- **Run scripts**

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

You can also configure more networks in `hardhat.config.ts` if needed.

---

### 🩻 Troubleshooting

- **MetaMask “Internal JSON-RPC error”**

  - Usually caused by a flaky or misconfigured RPC in MetaMask.
  - Check that the network in MetaMask uses:
    - RPC: `https://rpc.awakening.bdagscan.com`
    - Chain ID: `1043`
    - Symbol: `BDAG`

- **“Network error: Unable to connect to blockchain” (UI)**

  - The app’s error handler in `useMarketplace` detected a network issue.
  - Confirm your internet connection and RPC endpoint availability.

- **Products not visible after listing**
  - Ensure you are on **BlockDAG Testnet** in MetaMask (same network as the deployed contract).
  - Refresh the page; `DigitalMarketplace` reloads products on mount.

---

### 💡 Ideas for Extension

- On‑chain royalty support
- Ratings and reviews for products
- Allow multiple file attachments per product
- Email / webhook notifications after purchases

---

**Enjoy building on BlockDAG!**  
If you have issues or feature ideas, feel free to open an issue or contribute.
