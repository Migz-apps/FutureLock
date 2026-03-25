# 🔒 FutureLock: Time-Locked Intelligence Market

**FutureLock** is a decentralized marketplace where creators sell "Future Intelligence"—encrypted insights, predictions, or strategies that are cryptographically locked until a specific future date. It creates a verifiable market for foresight and intellectual speculation.

## 🚀 Key Features
- **Proof of Foresight:** Creators prove their credibility by locking data that only reveals its value at a set time.
- **On-Chain Escrow:** Smart contracts handle payments and ensure content hash integrity.
- **Decentralized Storage:** Encrypted payloads are stored on IPFS to ensure data longevity without central points of failure.
- **Reputation Scoring:** Creator scores fluctuate based on the accuracy/quality of insights after the unlock date.

## 🏗️ Tech Stack
- **Frontend:** Next.js, Tailwind CSS, RainbowKit (Wallet Connection)
- **Blockchain:** Solidity, Hardhat, Polygon/Ethereum
- **Backend:** FastAPI (Python), Fernet/AES Encryption
- **Storage:** IPFS (via Pinata)

## 📋 User Flow
1. **Creator** inputs insight -> Content is encrypted locally via AES.
2. **Backend** uploads the encrypted file to IPFS and returns the CID (Content Identifier).
3. **Smart Contract** stores the CID, Price, and Unlock Timestamp.
4. **Buyer** purchases access; the transaction is recorded on-chain.
5. **Unlock:** Once `block.timestamp >= unlockTime`, the decryption key is released/enabled for the buyer to view the content.

## 🛠️ Getting Started

### 1. Smart Contracts
```bash
cd blockchain
npx hardhat compile
npx hardhat node