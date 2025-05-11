# 🎫 ZK Compressed Token System for Proof-of-Participation

A seamless solution for hackathons, conferences, and events to create, distribute, and verify proof-of-participation tokens using Solana's ZK Compression technology.

![Demo Preview](https://i.postimg.cc/jjgwgGNs/Screenshot-2025-05-12-001657.png)

## ✨ Features

- **ZK-Compressed Tokens**: Uses Light Protocol's compression system to reduce token distribution costs by 98%
- **Solana Pay Integration**: QR code scanning for instant token claiming
- **Organizer Dashboard**: Create token types, mint, and compress tokens in bulk
- **Participant Interface**: Easily claim and verify POP tokens
- **Enterprise-Ready**: Batch processing, error handling, and automatic retries

## 🔍 Why ZK Compression?

Traditional on-chain tokens face scalability limitations and high costs. ZK Compression allows us to:

- **Reduce Costs**: Creating and transferring thousands of POP tokens becomes economically viable
- **Preserve Security**: All tokens maintain the security guarantees of Solana's L1
- **Scale Efficiently**: Support large events with thousands of participants

## 📱 How It Works

1. **Create**: Event organizers create a custom POP token type
2. **Mint**: Tokens are minted to a treasury wallet
3. **Compress**: Regular SPL tokens are compressed to reduce on-chain footprint
4. **Distribute**: QR codes are generated for each attendee or activity
5. **Claim**: Attendees scan QR codes to claim their compressed tokens
6. **Verify**: Tokens serve as verifiable proof of attendance

## 🚀 Live Demo

- **Frontend**: [https://sol-token.vercel.app](https://sol-token.vercel.app)
- **Backend API**: [https://sol-token-backend.onrender.com](https://sol-token-backend.onrender.com)
- **Status Endpoint**: [https://sol-token-backend.onrender.com/api/pop/status](https://sol-token-backend.onrender.com/api/pop/status)

## 🛠️ Technical Implementation

### Architecture

The system consists of two main components:
- **Backend**: Node.js/Express API that interacts with Solana and Light Protocol
- **Frontend**: React web app with Solana wallet adapter integration

### Key Technologies

- **Light Protocol**: For ZK compression of tokens
- **Solana Web3.js**: For blockchain interactions
- **SPL Token**: For token creation and management
- **Solana Pay**: For QR code generation and scanning

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/pop/create-type` | Create a new POP token type |
| `POST /api/pop/mint-to-treasury` | Mint tokens to treasury wallet |
| `POST /api/pop/compress-tokens` | Compress SPL tokens into cTokens |
| `POST /api/pop/claim` | Claim compressed tokens (via QR) |
| `GET /api/pop/status` | Check system status and token info |

## 📋 Setup & Deployment

### Prerequisites

- Node.js v16+
- Solana devnet account with SOL
- Light Protocol API key

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sol-token.git
   cd sol-token
   ```

2. Install dependencies for backend:
   ```bash
   npm install
   ```

3. Install dependencies for frontend:
   ```bash
   cd client
   npm install
   ```

4. Set up environment variables:
   ```
   # Backend (.env)
   RPC_URL=https://devnet.solanalightapi.com/YOUR_API_KEY
   PORT=3000
   CREATOR_WALLET_SECRET_KEY=[your-creator-wallet-secret-key]
   TREASURY_WALLET_SECRET_KEY=[your-treasury-wallet-secret-key]
   
   # Frontend (client/.env)
   REACT_APP_API_URL=http://localhost:3000
   REACT_APP_SOLANA_NETWORK=devnet
   ```

5. Run the backend:
   ```bash
   npm run dev
   ```

6. Run the frontend:
   ```bash
   cd client
   npm start
   ```

## 📊 Performance Metrics

| Metric | Traditional SPL | Compressed Tokens | Improvement |
|--------|-----------------|-------------------|-------------|
| Cost per Token | ~0.000055 SOL | ~0.000001 SOL | 98% reduction |
| Transaction Size | ~450 bytes | ~120 bytes | 73% reduction |
| Tokens per Tx | ~5 | ~20 | 4x increase |
| Time to Create 1000 Tokens | ~200 sec | ~50 sec | 75% faster |

## 🏢 Real-World Use Cases

1. **Tech Conferences**: Issue POPs for attendees and session participants
2. **Hackathons**: Verify participation and task completion 
3. **Online Courses**: Track completion of modules and assignments
4. **Gaming Tournaments**: Distribute participation awards at scale
5. **Corporate Training**: Verify employee course completion

## 🔮 Future Extensions

- **On-chain Reputation System**: Building on POPs for verified credentials
- **Multi-chain Support**: Extend to Solana sidechains
- **Tiered Token System**: Different token levels for varied participation
- **Revenue Sharing**: Enable royalties on secondary market transfers
- **Enhanced Privacy**: Additional ZK features for private attendance data

## 📜 License

MIT License

## 🙏 Acknowledgements

- Light Protocol for ZK compression technology
- Solana Foundation for the hackathon opportunity
- Helius for infrastructure support
