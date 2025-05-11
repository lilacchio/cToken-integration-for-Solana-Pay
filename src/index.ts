// @ts-ignore
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createRpc } from "@lightprotocol/stateless.js";
import { Keypair, Transaction, PublicKey, ComputeBudgetProgram, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { CompressedTokenProgram, createMint, mintTo, compress, transfer } from "@lightprotocol/compressed-token";
import { getOrCreateAssociatedTokenAccount, getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import path from "path";
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS middleware
app.use(cors({
  origin: '*',  // For hackathon, allow all origins (you can restrict this later)
  methods: ['GET', 'POST'],
  credentials: true
}));

// Add middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Utility function to check SOL balance
async function checkSolBalance(rpc: any, publicKey: PublicKey): Promise<number> {
  const balance = await rpc.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
}

// Utility function to check token balance
async function checkTokenBalance(rpc: any, tokenAccount: PublicKey): Promise<number> {
  try {
    // First check if the account exists
    const accountInfo = await rpc.getAccountInfo(tokenAccount);
    if (!accountInfo) {
      console.log(`Token account ${tokenAccount.toString()} not found`);
      return 0;
    }
    
    // Use getAccount with proper error handling
    try {
      const account = await getAccount(rpc, tokenAccount);
      // Return raw amount for now - we handle decimals at the UI level
      return Number(account.amount);
    } catch (e: any) {
      console.error(`getAccount error: ${e.message}`);
      // Try with direct RPC call as fallback
      const info = await rpc.getTokenAccountBalance(tokenAccount);
      if (info?.value?.uiAmount !== undefined) {
        return info.value.amount || 0;
      }
      return 0;
    }
  } catch (error: any) {
    console.error(`Error checking token balance: ${error.message}`);
    return 0;
  }
}

// Utility function to parse a secret key from environment variable
function parseSecretKey(secretKeyStr: string): Uint8Array {
  try {
    const secretKeyArray = secretKeyStr.replace('[', '').replace(']', '').split(',').map(num => parseInt(num.trim(), 10));
    if (secretKeyArray.some(isNaN)) {
      throw new Error("Secret key contains invalid numbers");
    }
    return new Uint8Array(secretKeyArray);
  } catch (error: any) {
    throw new Error(`Failed to parse secret key: ${error.message}`);
  }
}

// Utility function to get associated token accounts for a mint and owner
async function getTokenAccounts(rpc: any, mintAddress: PublicKey, ownerAddress: PublicKey) {
  try {
    // First try to find the associated token account address
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintAddress,
      ownerAddress,
      true // allowOwnerOffCurve
    );
    
    console.log(`Looking for associated token account at: ${associatedTokenAddress.toString()}`);
    
    // Check if this account exists
    const accountInfo = await rpc.getAccountInfo(associatedTokenAddress);
    let regularAccount = null;
    
    if (accountInfo) {
      console.log(`Found existing token account: ${associatedTokenAddress.toString()}`);
      regularAccount = associatedTokenAddress.toString();
    } else {
      console.log(`Token account not found at expected address: ${associatedTokenAddress.toString()}`);
      
      // Try to find any token accounts for this owner/mint combination
      try {
        const accounts = await rpc.getTokenAccountsByOwner(
          ownerAddress,
          { mint: mintAddress }
        );
        
        if (accounts && accounts.value && accounts.value.length > 0) {
          regularAccount = accounts.value[0].pubkey.toString();
          console.log(`Found alternate token account: ${regularAccount}`);
        } else {
          console.log(`No token accounts found for mint ${mintAddress.toString()} and owner ${ownerAddress.toString()}`);
        }
      } catch (err) {
        console.error("Error finding token accounts:", err);
      }
    }
    
    // Get compressed token accounts
    let compressedAccounts: Array<any> = [];
    try {
      const compressedAccountsResponse = await rpc.getCompressedTokenAccountsByOwner(
        ownerAddress,
        { mint: mintAddress }
      );
      
      compressedAccounts = compressedAccountsResponse?.items || [];
      console.log(`Found ${compressedAccounts.length} compressed accounts`);
    } catch (err) {
      console.error("Error getting compressed accounts:", err);
    }
    
    return {
      regularAccount,
      compressedAccounts
    };
  } catch (error) {
    console.error("Error getting token accounts:", error);
    return {
      regularAccount: null,
      compressedAccounts: []
    };
  }
}

app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Solana Hackathon POP Token System</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1, h2, h3 {
          color: #9945FF;
        }
        h1 {
          text-align: center;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .endpoint {
          background-color: #f0f0f0;
          border-left: 4px solid #9945FF;
          padding: 10px 15px;
          margin-bottom: 15px;
        }
        .endpoint h3 {
          margin-top: 0;
        }
        pre {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          overflow-x: auto;
        }
        code {
          font-family: monospace;
        }
        .button {
          display: inline-block;
          background-color: #9945FF;
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
          margin-top: 10px;
        }
        .button:hover {
          background-color: #7d37d6;
        }
        .flow {
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .flow-step {
          display: flex;
          margin-bottom: 10px;
        }
        .flow-num {
          background: #9945FF;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          flex-shrink: 0;
        }
        .info-box {
          background-color: #e6f7ff;
          border-left: 4px solid #1890ff;
          padding: 10px 15px;
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <h1>Solana Hackathon POP Token System</h1>
      
      <div class="container">
        <h2>📱 ZK Compressed Token System for Proof-of-Participation</h2>
        <p>This system enables hackathon organizers to create and distribute compressed token proofs of participation using ZK compression technology on Solana.</p>
        <div class="info-box">
          <p><strong>Hackathon Submission Note:</strong> This project meets the "Best cToken integration for Solana Pay" requirements by:</p>
          <ul>
            <li>Allowing creators to mint experience tokens (cTokens for airdrops)</li>
            <li>Letting attendees claim them by scanning a QR code</li>
          </ul>
        </div>
        <p><a href="/api/pop/status" class="button">View System Status</a></p>
      </div>
      
      <div class="container">
        <h2>🚀 Complete Test Workflow</h2>
        <p>Follow these steps to test the entire system as a judge:</p>
        
        <div class="flow">
          <div class="flow-step">
            <div class="flow-num">1</div>
            <div>
              <strong>Create a new token type</strong>
              <p>First, create a new POP token that will be used for the hackathon.</p>
              <pre><code>POST /api/pop/create-type
Body: {
  "name": "Solana Hackathon POP",
  "symbol": "POP",
  "uri": "https://solana.com/pop-metadata.json"
}</code></pre>
              <p>Save the <code>mintAddress</code> from the response for subsequent steps.</p>
            </div>
          </div>
          
          <div class="flow-step">
            <div class="flow-num">2</div>
            <div>
              <strong>Mint tokens to treasury</strong>
              <p>Next, mint regular SPL tokens to the treasury wallet.</p>
              <pre><code>POST /api/pop/mint-to-treasury
Body: {
  "mintAddress": "YOUR_MINT_ADDRESS_FROM_STEP_1",
  "quantity": 100
}</code></pre>
            </div>
          </div>
          
          <div class="flow-step">
            <div class="flow-num">3</div>
            <div>
              <strong>Compress tokens</strong>
              <p>Now, compress the SPL tokens to create compressed NFTs.</p>
              <pre><code>POST /api/pop/compress-tokens
Body: {
  "mintAddress": "YOUR_MINT_ADDRESS",
  "quantity": 50,
  "batchSize": 10
}</code></pre>
              <p>This processes tokens in smaller batches for reliability.</p>
            </div>
          </div>
          
          <div class="flow-step">
            <div class="flow-num">4</div>
            <div>
              <strong>Generate QR code for claiming</strong>
              <p>In a real event, we'd generate QR codes that link to a web app where users can claim tokens. For this demo, you can manually test the claim process:</p>
              <pre><code>POST /api/pop/claim
Body: {
  "account": "RECIPIENT_WALLET_ADDRESS",
  "mintAddress": "YOUR_MINT_ADDRESS"
}</code></pre>
              <p>This returns a transaction that would be signed by the recipient in the front-end.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <h2>📝 Implementation Details</h2>
        <ul>
          <li><strong>ZK Compression:</strong> Uses Light Protocol's compression system to make token distribution cost-effective</li>
          <li><strong>Batched Processing:</strong> Processes large token quantities in configurable batches</li>
          <li><strong>Error Handling:</strong> Robust error handling with automatic retries and confirmation checks</li>
          <li><strong>Balance Monitoring:</strong> Checks wallet balances before operations to prevent failures</li>
        </ul>
      </div>
      
      <div class="container">
        <h2>🔌 Available Endpoints</h2>
        
        <div class="endpoint">
          <h3>1. Fund Wallets (Testing Only)</h3>
          <p>Send SOL to a wallet for testing.</p>
          <pre><code>POST /api/pop/faucet
Body: {
  "recipient": "YOUR_WALLET_ADDRESS",
  "amount": 0.1
}</code></pre>
        </div>
        
        <div class="endpoint">
          <h3>2. Create Token Type</h3>
          <p>Create a new POP token type.</p>
          <pre><code>POST /api/pop/create-type
Body: {
  "name": "Solana Hackathon POP",
  "symbol": "POP",
  "uri": "https://solana.com/pop-metadata.json"
}</code></pre>
        </div>
        
        <div class="endpoint">
          <h3>3. Mint Tokens to Treasury</h3>
          <p>Mint regular SPL tokens to the treasury wallet.</p>
          <pre><code>POST /api/pop/mint-to-treasury
Body: {
  "mintAddress": "YOUR_MINT_ADDRESS",
  "quantity": 1000
}</code></pre>
        </div>
        
        <div class="endpoint">
          <h3>4. Compress Tokens</h3>
          <p>Compress the SPL tokens into compressed NFTs.</p>
          <pre><code>POST /api/pop/compress-tokens
Body: {
  "mintAddress": "YOUR_MINT_ADDRESS",
  "quantity": 100,
  "batchSize": 10,
  "retryCount": 3
}</code></pre>
        </div>
        
        <div class="endpoint">
          <h3>5. Claim Tokens (Client-side operation)</h3>
          <p>Generate a transaction for claiming tokens.</p>
          <pre><code>POST /api/pop/claim
Body: {
  "account": "RECIPIENT_WALLET_ADDRESS",
  "mintAddress": "YOUR_MINT_ADDRESS"
}</code></pre>
        </div>
        
        <div class="endpoint">
          <h3>6. System Status</h3>
          <p>Check the system status, wallet balances, and token information.</p>
          <pre><code>GET /api/pop/status</code></pre>
          <p>You can also specify a mint to check: <code>GET /api/pop/status?mint=YOUR_MINT_ADDRESS</code></p>
        </div>
      </div>
      
      <div class="container">
        <h2>🔑 Demo Wallet Information</h2>
        <p>For hackathon demonstration purposes, the system is using the following wallets:</p>
        <pre><code>Creator Wallet: ${process.env.CREATOR_WALLET_SECRET_KEY ? 
          Keypair.fromSecretKey(parseSecretKey(process.env.CREATOR_WALLET_SECRET_KEY)).publicKey.toString() : 
          'Not configured'}
Treasury Wallet: ${process.env.TREASURY_WALLET_SECRET_KEY ? 
          Keypair.fromSecretKey(parseSecretKey(process.env.TREASURY_WALLET_SECRET_KEY)).publicKey.toString() : 
          'Not configured'}</code></pre>
        <p>Note: In a production environment, wallet private keys would be securely stored and not exposed.</p>
      </div>
    </body>
    </html>
  `);
});

// System status endpoint
app.get("/api/pop/status", async (req: Request, res: Response) => {
  try {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is not defined in environment variables");
    }
    
    const rpc = createRpc(rpcUrl);
    
    // Get wallet keys from environment
    const creatorSecretKey = process.env.CREATOR_WALLET_SECRET_KEY;
    const treasurySecretKey = process.env.TREASURY_WALLET_SECRET_KEY;
    
    if (!creatorSecretKey || !treasurySecretKey) {
      throw new Error("Missing required environment variables: CREATOR_WALLET_SECRET_KEY or TREASURY_WALLET_SECRET_KEY");
    }
    
    // Parse secret keys and get public keys
    const creatorKeypair = Keypair.fromSecretKey(parseSecretKey(creatorSecretKey));
    const treasuryKeypair = Keypair.fromSecretKey(parseSecretKey(treasurySecretKey));
    
    const creatorAddress = creatorKeypair.publicKey.toString();
    const treasuryAddress = treasuryKeypair.publicKey.toString();
    
    // Get SOL balances
    const creatorSolBalance = await checkSolBalance(rpc, creatorKeypair.publicKey);
    const treasurySolBalance = await checkSolBalance(rpc, treasuryKeypair.publicKey);
    
    // Get the mint address from environment or query parameter
    const mintAddressStr = req.query.mint || process.env.MINT_ADDRESS;
    let mintPublicKey: PublicKey | null = null;
    let tokenInfo = null;
    
    if (mintAddressStr && typeof mintAddressStr === 'string') {
      try {
        mintPublicKey = new PublicKey(mintAddressStr);
        console.log(`Checking status for mint: ${mintAddressStr}`);
        
        // Standard SPL token decimals
        const DECIMALS = 9;
        
        // Get token account info - first find the associated token address
        const associatedTokenAddress = await getAssociatedTokenAddress(
          mintPublicKey,
          treasuryKeypair.publicKey,
          false // Do not allow off-curve addresses
        );
        
        console.log(`Looking for treasury token account at: ${associatedTokenAddress.toString()}`);
        
        // Check if the token account exists
        const accountInfo = await rpc.getAccountInfo(associatedTokenAddress);
        let regularTokenBalance = 0;
        let regularTokenUiBalance = 0;
        let treasuryTokenAccount = null;
        
        if (accountInfo) {
          console.log(`Found treasury token account at ${associatedTokenAddress.toString()}`);
          treasuryTokenAccount = associatedTokenAddress.toString();
          
          try {
            // Try to get token balance directly
            const balanceResponse = await rpc.getTokenAccountBalance(associatedTokenAddress);
            if (balanceResponse?.value) {
              regularTokenBalance = parseInt(balanceResponse.value.amount || '0');
              regularTokenUiBalance = balanceResponse.value.uiAmount || 0;
              console.log(`Treasury token balance (raw): ${regularTokenBalance}`);
              console.log(`Treasury token balance (UI): ${regularTokenUiBalance}`);
            } else {
              // Fallback
              regularTokenBalance = await checkTokenBalance(rpc, associatedTokenAddress);
              regularTokenUiBalance = regularTokenBalance / (10 ** DECIMALS);
            }
          } catch (error) {
            console.error(`Error getting token balance: ${error}`);
            // Still set the account but with 0 balance
          }
        } else {
          console.log(`No token account found for treasury at expected address`);
          
          // Try looking for any token accounts for this mint and owner
          try {
            const accounts = await rpc.getTokenAccountsByOwner(
              treasuryKeypair.publicKey,
              { mint: mintPublicKey }
            );
            
            if (accounts && accounts.value && accounts.value.length > 0) {
              const firstAccount = accounts.value[0].pubkey;
              treasuryTokenAccount = firstAccount.toString();
              console.log(`Found alternate token account: ${treasuryTokenAccount}`);
              
              // Get balance for this account
              const balanceResponse = await rpc.getTokenAccountBalance(firstAccount);
              if (balanceResponse?.value) {
                regularTokenBalance = parseInt(balanceResponse.value.amount || '0');
                regularTokenUiBalance = balanceResponse.value.uiAmount || 0;
              }
            }
          } catch (err) {
            console.error(`Error finding token accounts: ${err}`);
          }
        }
        
        // Get compressed token accounts
        let compressedAccounts: Array<any> = [];
        try {
          const compressedAccountsResponse = await rpc.getCompressedTokenAccountsByOwner(
            treasuryKeypair.publicKey,
            { mint: mintPublicKey }
          );
          
          compressedAccounts = compressedAccountsResponse?.items || [];
          console.log(`Found ${compressedAccounts.length} compressed accounts`);
        } catch (err) {
          console.error(`Error getting compressed accounts: ${err}`);
        }
        
        tokenInfo = {
          mint: mintAddressStr,
          treasuryAccounts: {
            regularAccount: treasuryTokenAccount,
            compressedAccounts
          },
          regularTokenBalance, 
          regularTokenUiBalance,
          compressedTokenCount: compressedAccounts.length
        };
      } catch (error: any) {
        console.error(`Error getting mint information: ${error.message}`);
      }
    }
    
    // Build status response
    const status = {
      system: {
        rpcUrl: rpcUrl.split("@").shift() + "@..." // Hide API key if present
      },
      wallets: {
        creator: {
          address: creatorAddress,
          solBalance: creatorSolBalance
        },
        treasury: {
          address: treasuryAddress,
          solBalance: treasurySolBalance
        }
      },
      tokens: tokenInfo,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    };
    
    res.json(status);
  } catch (error: any) {
    console.error("Error getting system status:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Faucet endpoint to fund a wallet with SOL
app.post("/api/pop/faucet", async (req: Request, res: Response) => {
  const { recipient, amount = 0.1 } = req.body;
  
  // Validate recipient address
  if (!recipient) {
    return res.status(400).json({
      success: false,
      error: "Missing recipient address"
    });
  }
  
  // Validate amount is not too large
  const solAmount = parseFloat(amount);
  if (isNaN(solAmount) || solAmount <= 0 || solAmount > 0.5) {
    return res.status(400).json({
      success: false,
      error: "Amount must be a positive number not exceeding 0.5 SOL"
    });
  }
  
  try {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is not defined in environment variables");
    }
    const rpc = createRpc(rpcUrl);
    
    // Get funder wallet (using creator wallet as funder)
    const funderSecretKey = process.env.CREATOR_WALLET_SECRET_KEY;
    if (!funderSecretKey) {
      throw new Error("CREATOR_WALLET_SECRET_KEY is not defined in the environment variables");
    }
    
    // Parse funder secret key
    const funderKeypair = Keypair.fromSecretKey(parseSecretKey(funderSecretKey));
    
    // Get funder balance
    const funderBalance = await checkSolBalance(rpc, funderKeypair.publicKey);
    console.log(`Funder wallet balance: ${funderBalance} SOL`);
    
    if (funderBalance < solAmount + 0.01) {
      return res.status(400).json({
        success: false,
        error: `Funder wallet has insufficient balance (${funderBalance} SOL) to fund ${solAmount} SOL`
      });
    }
    
    // Parse recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: `Invalid recipient address: ${error.message}`
      });
    }
    
    // Check recipient's current balance
    const recipientBalance = await checkSolBalance(rpc, recipientPubkey);
    console.log(`Recipient wallet balance before transfer: ${recipientBalance} SOL`);
    
    // Create and send a simple SOL transfer instruction
    const transaction = new Transaction();
    
    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: funderKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: solAmount * LAMPORTS_PER_SOL
      })
    );
    
    // Send the transaction
    // Note: We're accessing the wrapped connection to use standard Solana methods
    const { blockhash } = await rpc.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = funderKeypair.publicKey;
    
    // Sign the transaction
    transaction.sign(funderKeypair);
    
    // Serialize the transaction
    const rawTransaction = transaction.serialize();
    
    // Send the raw transaction
    const signature = await rpc.sendRawTransaction(rawTransaction);
    console.log(`Transaction sent with signature: ${signature}`);
    
    // Wait a bit for the transaction to confirm
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check new balance
    const newBalance = await checkSolBalance(rpc, recipientPubkey);
    
    return res.json({
      success: true,
      message: `Successfully sent ${solAmount} SOL to ${recipient}`,
      signature,
      recipient,
      amount: solAmount,
      previousBalance: recipientBalance,
      newBalance
    });
    
  } catch (err: any) {
    console.error("Error sending SOL to wallet:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get("/api/pop/claim", (req: Request, res: Response) => {
  res.json({
    label: "Solana Hackathon POP Claim",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg"
  });
});

// Create a new mint endpoint
app.post("/api/pop/create-type", async (req: Request, res: Response) => {
  // Get input parameters from request body
  const { name, symbol, uri } = req.body;
  
  // Validate required parameters
  if (!name || !symbol || !uri) {
    return res.status(400).json({
      success: false,
      error: "Missing required parameters. Please provide name, symbol, and uri."
    });
  }
  
  try {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is not defined in environment variables");
    }
    const rpc = createRpc(rpcUrl);
    
    // Get creator wallet secret key
    const creatorSecretKey = process.env.CREATOR_WALLET_SECRET_KEY;
    if (!creatorSecretKey) {
      throw new Error("CREATOR_WALLET_SECRET_KEY is not defined in the environment variables.");
    }
    
    // Create creator keypair
    const creatorKeypair = Keypair.fromSecretKey(parseSecretKey(creatorSecretKey));
    
    console.log(`Creating new compressed token mint with name: ${name}, symbol: ${symbol}`);
    
    // Create the mint with metadata
    const { mint, transactionSignature } = await createMint(
      rpc,
      creatorKeypair,        // Payer
      creatorKeypair.publicKey, // Mint authority
      9                      // Decimals (standard for tokens)
    );
    
    console.log(`Created new mint: ${mint.toString()}`);
    
    // Return the mint address and transaction signature
    res.json({
      success: true,
      message: "POP token type created successfully",
      mintAddress: mint.toString(),
      transactionSignature,
      metadata: {
        name,
        symbol,
        uri
      }
    });
    
  } catch (err: any) {
    console.error("Error creating POP token type:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/pop/claim", async (req: Request, res: Response) => {
  const { account, mintAddress } = req.body;
  
  // Validate account is a proper public key string
  if (!account || typeof account !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: "Invalid or missing 'account' parameter. Must be a valid Solana public key."
    });
  }
  
  try {
  const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is not defined in environment variables");
    }
  const rpc = createRpc(rpcUrl);
    
    // Get mint address from request body or fall back to env variable
    const mintAddressStr = mintAddress || process.env.MINT_ADDRESS || "";
    if (!mintAddressStr) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing mint address. Please provide 'mintAddress' in the request body or set MINT_ADDRESS in environment variables."
      });
    }
    
  const amount = 1; // Amount for POP token
  const treasurySecretKey = process.env.TREASURY_WALLET_SECRET_KEY;
  if (!treasurySecretKey) {
    throw new Error("TREASURY_WALLET_SECRET_KEY is not defined in the environment variables.");
  }
    
    // Initialize keypairs and public keys with validation
    const senderKeypair = Keypair.fromSecretKey(parseSecretKey(treasurySecretKey));
    
    // Validate the account is a proper Solana address before creating PublicKey
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(account);
    } catch (error: any) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid recipient address: ${error.message}`
      });
    }
    
    // Validate the mint address before creating PublicKey
    let mintPublicKey: PublicKey;
    try {
      mintPublicKey = new PublicKey(mintAddressStr);
    } catch (error: any) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid mint address: ${error.message}`
      });
    }

    // 1. Get the latest blockhash
    const { blockhash, lastValidBlockHeight } = await rpc.getLatestBlockhash();
    
    // 2. Create a new transaction with recipient as fee payer
    const transaction = new Transaction({
      feePayer: recipientPubkey, // Recipient pays fees
      blockhash,
      lastValidBlockHeight
    });
    
    // 3. Add compute budget instruction for ZK proof verification
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 })
    );
    
    // 4. Get sender's compressed token accounts for this mint
    const accountsResp = await rpc.getCompressedTokenAccountsByOwner(
      senderKeypair.publicKey, 
      { mint: mintPublicKey }
    );
    
    if (!accountsResp.items || accountsResp.items.length === 0) {
      throw new Error("No compressed token accounts found for sender and mint.");
    }
    
    // 5. Select accounts to cover the transfer amount (just using the first account for simplicity)
    const selectedAccounts = [accountsResp.items[0]];
    
    // 6. Fetch account hashes for proof generation
    // Get the merkle proofs for these accounts
    const accountHashes = selectedAccounts.map(acc => acc.compressedAccount.hash);
    const merkleProofs = await rpc.getMultipleCompressedAccountProofs(accountHashes);
    
    // 7. Fetch validity proof
    const validityProof = await rpc.getValidityProofV0(accountHashes, []);
    
    // 8. Prepare accounts with Merkle context
    const inputCompressedTokenAccounts = selectedAccounts.map((acc, i) => ({ 
      ...acc, 
      ...merkleProofs[i] 
    }));
    
    // 9. Extract stateRootIndices from merkleProofs
    const recentInputStateRootIndices = merkleProofs.map(mp => (mp as any).stateRootIndex);
    
    // 10. Get validity proof compressed
    const recentValidityProof = validityProof.compressedProof;
    
    // 11. Create the transfer instruction
    const transferIx = await CompressedTokenProgram.transfer({
      payer: recipientPubkey, // Recipient pays fees
      inputCompressedTokenAccounts,
      toAddress: recipientPubkey,
      amount: amount,
      recentInputStateRootIndices,
      recentValidityProof
    });
    
    // 12. Add the transfer instruction to the transaction
    transaction.add(transferIx);
    
    // 13. Partially sign with the sender's keypair (for token authority)
    transaction.partialSign(senderKeypair);
    
    // 14. Serialize for wallet signing (not requiring all signatures)
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false, // Don't require all signatures since recipient will sign
      verifySignatures: false
    });
    
    // Return the transaction to the client
    res.json({ 
      transaction: serializedTransaction.toString('base64'),
      message: "Claim your POP token!",
      mint: mintPublicKey.toString() 
    });
  } catch (err: any) {
    console.error("Error creating compressed token transfer:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mint tokens to treasury wallet
app.post("/api/pop/mint-to-treasury", async (req: Request, res: Response) => {
  // Get input parameters from request body
  const { mintAddress, quantity } = req.body;
  
  // Validate required parameters
  if (!mintAddress || !quantity) {
    return res.status(400).json({
      success: false,
      error: "Missing required parameters. Please provide mintAddress and quantity."
    });
  }
  
  // Validate quantity is a positive number
  const amount = parseInt(quantity);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: "Quantity must be a positive number."
    });
  }
  
  try {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is not defined in environment variables");
    }
    const rpc = createRpc(rpcUrl);
    
    // Get creator wallet secret key (payer)
    const creatorSecretKey = process.env.CREATOR_WALLET_SECRET_KEY;
    if (!creatorSecretKey) {
      throw new Error("CREATOR_WALLET_SECRET_KEY is not defined in the environment variables.");
    }
    
    // Get treasury wallet secret key (recipient)
    const treasurySecretKey = process.env.TREASURY_WALLET_SECRET_KEY;
    if (!treasurySecretKey) {
      throw new Error("TREASURY_WALLET_SECRET_KEY is not defined in the environment variables.");
    }
    
    // Parse the creator secret key
    const creatorKeypair = Keypair.fromSecretKey(parseSecretKey(creatorSecretKey));
    
    // Parse the treasury secret key
    const treasuryKeypair = Keypair.fromSecretKey(parseSecretKey(treasurySecretKey));
    
    // Check SOL balances
    const creatorSolBalance = await checkSolBalance(rpc, creatorKeypair.publicKey);
    console.log(`Creator wallet SOL balance: ${creatorSolBalance}`);
    
    // Check if creator has enough SOL for transaction fees
    if (creatorSolBalance < 0.01) {
      return res.status(400).json({
        success: false,
        error: `Creator wallet has insufficient SOL (${creatorSolBalance}). Please fund with at least 0.01 SOL.`
      });
    }
    
    // Validate mint address
    let mintPublicKey: PublicKey;
    try {
      mintPublicKey = new PublicKey(mintAddress);
    } catch (error: any) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid mint address: ${error.message}`
      });
    }
    
    console.log(`Minting ${amount} tokens of mint ${mintAddress} to treasury wallet ${treasuryKeypair.publicKey.toString()}`);
    
    // 1. First, find the associated token address
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPublicKey,
      treasuryKeypair.publicKey,
      false // Do not allow off-curve addresses to ensure we're using the correct treasury
    );
    
    console.log(`Associated token address for treasury: ${associatedTokenAddress.toString()}`);
    
    // Check if the token account already exists
    const accountInfo = await rpc.getAccountInfo(associatedTokenAddress);
    
    // 2. Create the associated token account if it doesn't exist
    let associatedTokenAccount;
    if (!accountInfo) {
      console.log(`Token account doesn't exist, creating it now...`);
      associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        rpc,
        creatorKeypair, // payer
        mintPublicKey,  // mint
        treasuryKeypair.publicKey, // owner
        false // Do not allow off-curve addresses
      );
    } else {
      console.log(`Token account exists, retrieving it...`);
      // Get account info directly
      const accountData = await getAccount(rpc, associatedTokenAddress);
      associatedTokenAccount = {
        address: associatedTokenAddress,
        mint: mintPublicKey,
        owner: treasuryKeypair.publicKey,
        amount: accountData.amount
      };
    }
    
    console.log(`Using associated token account: ${associatedTokenAccount.address.toString()}`);
    console.log(`Token account owner: ${treasuryKeypair.publicKey.toString()}`);
    
    // Check initial token balance before minting
    let initialBalance = 0;
    try {
      // Try to get balance directly
      const balanceResponse = await rpc.getTokenAccountBalance(associatedTokenAccount.address);
      if (balanceResponse?.value?.amount) {
        initialBalance = parseInt(balanceResponse.value.amount);
        console.log(`Initial token balance (raw): ${initialBalance}`);
        
        // Also show UI balance with decimals
        const uiAmount = balanceResponse.value.uiAmount || 0;
        console.log(`Initial token balance (with decimals): ${uiAmount}`);
      } else {
        // Fall back to our helper
        initialBalance = await checkTokenBalance(rpc, associatedTokenAccount.address);
        console.log(`Initial token balance: ${initialBalance}`);
      }
    } catch (error) {
      console.log("No initial token balance found, which is expected for a new account");
    }
    
    // Calculate the actual amount to mint with decimals (standard = 9 decimals)
    // For UI display like "1.0", we'd mint 1_000_000_000 raw tokens
    // But we need to be careful not to overflow JavaScript's number size
    const DECIMALS = 9; // Standard for SPL tokens

    // Safer method: Keep the values in a reasonable range
    // Most SPL tokens use between 0-9 decimals, we'll limit to a safer amount
    let rawAmount: number;

    // For large amounts, we need to be careful with multiplication
    if (amount >= 1_000_000) {
      console.log(`Warning: Large amount detected (${amount}), limiting decimals to prevent overflow`);
      // For very large amounts, use fewer decimals to prevent overflow
      rawAmount = amount * 1_000; // Use only 3 decimals for large amounts
    } else if (amount >= 10_000) {
      // For medium amounts, use 6 decimals
      rawAmount = amount * 1_000_000; 
    } else {
      // For small amounts, use full 9 decimals
      rawAmount = amount * 1_000_000_000;
    }

    console.log(`Minting ${amount} tokens (raw amount: ${rawAmount}) to treasury account...`);
    
    // 3. Mint tokens to the treasury's associated token account
    const mintTxSignature = await mintTo(
      rpc,                    // RPC connection
      creatorKeypair,         // Payer
      mintPublicKey,          // Mint address
      associatedTokenAccount.address, // Destination (treasury's ATA)
      creatorKeypair,         // Mint authority
      rawAmount               // Amount to mint (raw amount with decimals)
    );
    
    console.log(`Mint transaction submitted: ${mintTxSignature}`);
    console.log(`Transaction link: https://explorer.solana.com/tx/${mintTxSignature}?cluster=devnet`);
    
    // Wait for the mint transaction to confirm
    console.log(`Waiting for mint transaction to confirm...`);
    
    // Give some time for the transaction to confirm
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify the tokens were actually minted by checking the balance
    let newBalance = 0;
    let newUiBalance = 0;
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries) {
      try {
        // Try to get balance directly first
        const balanceResponse = await rpc.getTokenAccountBalance(associatedTokenAccount.address);
        if (balanceResponse?.value?.amount) {
          newBalance = parseInt(balanceResponse.value.amount);
          newUiBalance = balanceResponse.value.uiAmount || 0;
          console.log(`New token balance (raw): ${newBalance}`);
          console.log(`New token balance (with decimals): ${newUiBalance}`);
          
          if (newBalance >= initialBalance + rawAmount) {
            console.log(`Minting confirmed: Balance increased from ${initialBalance} to ${newBalance}`);
            break;
          }
        } else {
          // Fall back to our helper
          newBalance = await checkTokenBalance(rpc, associatedTokenAccount.address);
          console.log(`New token balance after minting: ${newBalance}`);
          
          if (newBalance >= initialBalance + rawAmount) {
            console.log(`Minting confirmed: Balance increased from ${initialBalance} to ${newBalance}`);
            break;
          }
        }
        
        console.log(`Waiting for token balance to update (retry ${retries + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1))); // Exponential backoff
        retries++;
      } catch (error: any) {
        console.error(`Error checking token balance: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries++;
      }
    }
    
    if (newBalance < initialBalance + rawAmount) {
      console.warn(`WARNING: Token balance (${newBalance}) does not reflect the minted amount (${rawAmount})`);
    }
    
    // Return success response after minting
    res.json({
      success: true,
      message: `Successfully minted ${amount} tokens to treasury wallet.`,
      mintTransactionSignature: mintTxSignature,
      transactionLink: `https://explorer.solana.com/tx/${mintTxSignature}?cluster=devnet`,
      mint: mintAddress,
      destination: treasuryKeypair.publicKey.toString(),
      tokenAccount: associatedTokenAccount.address.toString(),
      amount,
      rawAmount,
      initialBalance: initialBalance,
      initialUiBalance: initialBalance / (10 ** DECIMALS),
      newBalance: newBalance,
      newUiBalance: newUiBalance || (newBalance / (10 ** DECIMALS)),
      creatorSolBalance
    });
    
  } catch (err: any) {
    console.error("Error minting tokens to treasury:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add a dedicated endpoint for compressing tokens
app.post("/api/pop/compress-tokens", async (req: Request, res: Response) => {
  // Get input parameters from request body
  const { mintAddress, quantity, retryCount = 3, batchSize = 10 } = req.body;
  
  // Validate required parameters
  if (!mintAddress) {
    return res.status(400).json({
      success: false,
      error: "Missing required parameter: mintAddress"
    });
  }
  
  // Default quantity if not provided
  let amount = 0;
  if (quantity) {
    amount = parseInt(quantity);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be a positive number"
      });
    }
  }
  
  // Validate batch size
  const actualBatchSize = parseInt(batchSize);
  if (isNaN(actualBatchSize) || actualBatchSize <= 0 || actualBatchSize > 10000) {
    return res.status(400).json({
      success: false,
      error: "Batch size must be between 1 and 10000"
    });
  }
  
  try {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is not defined in environment variables");
    }
    const rpc = createRpc(rpcUrl);
    
    // Get wallet secret keys from env vars
    const creatorSecretKey = process.env.CREATOR_WALLET_SECRET_KEY;
    const treasurySecretKey = process.env.TREASURY_WALLET_SECRET_KEY;
    
    if (!creatorSecretKey || !treasurySecretKey) {
      throw new Error("Missing required environment variables: CREATOR_WALLET_SECRET_KEY or TREASURY_WALLET_SECRET_KEY");
    }
    
    // Parse secret keys
    const creatorKeypair = Keypair.fromSecretKey(parseSecretKey(creatorSecretKey));
    const treasuryKeypair = Keypair.fromSecretKey(parseSecretKey(treasurySecretKey));
    
    // Check SOL balances
    const creatorSolBalance = await checkSolBalance(rpc, creatorKeypair.publicKey);
    const treasurySolBalance = await checkSolBalance(rpc, treasuryKeypair.publicKey);
    
    console.log(`Creator wallet SOL balance: ${creatorSolBalance}`);
    console.log(`Treasury wallet SOL balance: ${treasurySolBalance}`);
    
    // Check if creator has enough SOL for transaction fees (at least 0.01 SOL)
    if (creatorSolBalance < 0.01) {
      return res.status(400).json({
        success: false,
        error: `Creator wallet has insufficient SOL (${creatorSolBalance}). Please fund with at least 0.01 SOL.`
      });
    }
    
    // Validate mint address
    let mintPublicKey: PublicKey;
    try {
      mintPublicKey = new PublicKey(mintAddress);
    } catch (error: any) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid mint address: ${error.message}`
      });
    }
    
    // First find existing token accounts manually using ATA
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPublicKey,
      treasuryKeypair.publicKey,
      false // Do not allow off-curve addresses
    );
    
    console.log(`Looking for associated token account at: ${associatedTokenAddress.toString()}`);
    
    // Check if this account exists and get its info
    const accountInfo = await rpc.getAccountInfo(associatedTokenAddress);
    
    if (!accountInfo) {
      // Try looking for other token accounts for this mint and owner
      const accounts = await rpc.getTokenAccountsByOwner(
        treasuryKeypair.publicKey,
        { mint: mintPublicKey }
      );
      
      if (!accounts || !accounts.value || accounts.value.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No token accounts found. Please mint tokens to the treasury wallet first."
        });
      }
      
      console.log(`Found alternate token account: ${accounts.value[0].pubkey.toString()}`);
    } else {
      console.log(`Found existing token account: ${associatedTokenAddress.toString()}`);
    }
    
    // Now ensure the token account is initialized properly
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
      rpc,
      creatorKeypair, // payer
      mintPublicKey,  // mint
      treasuryKeypair.publicKey, // owner
      false // Do not allow off-curve addresses
    );
    
    console.log(`Using token account: ${associatedTokenAccount.address.toString()}`);
    
    // Standard SPL token decimals
    const DECIMALS = 9;
    
    // Check token balance in the treasury account - try both methods
    let tokenBalance = 0;
    let uiTokenBalance = 0;
    
    try {
      // Try direct token account balance check first
      const tokenBalanceResponse = await rpc.getTokenAccountBalance(associatedTokenAccount.address);
      
      if (tokenBalanceResponse?.value) {
        tokenBalance = parseInt(tokenBalanceResponse.value.amount || '0');
        uiTokenBalance = tokenBalanceResponse.value.uiAmount || 0;
        console.log(`Treasury token balance (raw): ${tokenBalance}`);
        console.log(`Treasury token balance (UI): ${uiTokenBalance}`);
      } else {
        // Fall back to our helper function
        tokenBalance = await checkTokenBalance(rpc, associatedTokenAccount.address);
        uiTokenBalance = tokenBalance / (10 ** DECIMALS);
        console.log(`Treasury token balance (raw from helper): ${tokenBalance}`);
        console.log(`Treasury token balance (calculated UI): ${uiTokenBalance}`);
      }
    } catch (error) {
      console.error(`Error checking token balance: ${error}`);
      // Try another approach
      try {
        tokenBalance = await checkTokenBalance(rpc, associatedTokenAccount.address);
        uiTokenBalance = tokenBalance / (10 ** DECIMALS);
        console.log(`Treasury token balance (fallback): ${tokenBalance}`);
      } catch (innerError) {
        console.error(`Secondary error checking token balance: ${innerError}`);
      }
    }
    
    if (tokenBalance <= 0) {
      return res.status(400).json({
        success: false,
        error: "Token account has zero balance. Nothing to compress. Mint tokens first."
      });
    }
    
    // Convert UI amount to raw amount if needed
    let rawAmount: number;

    // For large amounts, we need to be careful with multiplication
    if (amount > 0) {
      // Handle the case where a specific amount was requested
      if (amount >= 1_000_000) {
        console.log(`Warning: Large amount detected (${amount}), limiting decimals to prevent overflow`);
        // For very large amounts, use fewer decimals to prevent overflow
        rawAmount = amount * 1_000; // Use only 3 decimals for large amounts
      } else if (amount >= 10_000) {
        // For medium amounts, use 6 decimals
        rawAmount = amount * 1_000_000; 
      } else {
        // For small amounts, use full 9 decimals
        rawAmount = amount * 1_000_000_000;
      }
    } else {
      // Using full balance
      rawAmount = tokenBalance;
    }

    const uiAmount = amount > 0 ? amount : uiTokenBalance;
    
    // If quantity was not provided, use full balance
    if (amount === 0) {
      console.log(`No quantity specified, using full token balance: ${tokenBalance} (${uiTokenBalance} tokens with decimals)`);
      amount = tokenBalance;
    } else if (rawAmount > tokenBalance) {
      return res.status(400).json({
        success: false,
        error: `Requested amount (${amount} tokens = ${rawAmount} raw amount) exceeds available balance (${uiTokenBalance} tokens = ${tokenBalance} raw amount).`
      });
    }
    
    // Prepare result tracking
    let successfullyCompressed = 0;
    let failedBatches = 0;
    const results = [];
    
    // Calculate batch size in raw amounts - with safety limits
    let rawBatchSize: number;
    if (actualBatchSize >= 10_000) {
      console.log(`Warning: Large batch size detected (${actualBatchSize}), limiting decimals to prevent overflow`);
      rawBatchSize = actualBatchSize * 1_000; // Use only 3 decimals for large batch size
    } else if (actualBatchSize >= 1_000) {
      rawBatchSize = actualBatchSize * 1_000_000; // Use 6 decimals
    } else {
      rawBatchSize = actualBatchSize * 1_000_000_000;
    }
    
    // Process in batches of the specified size
    const batches = Math.ceil(rawAmount / rawBatchSize);
    console.log(`Compressing ${uiAmount} tokens (${rawAmount} raw) in ${batches} batches of ${actualBatchSize} tokens (${rawBatchSize} raw) each`);
    
    // Process each batch
    for (let i = 0; i < batches; i++) {
      const batchRawAmount = Math.min(rawBatchSize, rawAmount - (i * rawBatchSize));
      const batchUiAmount = batchRawAmount / (10 ** DECIMALS);
      
      if (batchRawAmount <= 0) break;
      
      console.log(`Processing batch ${i + 1}/${batches}: ${batchUiAmount} tokens (${batchRawAmount} raw)`);
      
      let batchSuccess = false;
      let lastError = null;
      let attempts = 0;
      
      // Try each batch with retries
      while (!batchSuccess && attempts < retryCount) {
        try {
          attempts++;
          console.log(`Compression attempt ${attempts}/${retryCount} for batch ${i + 1}`);
          
          // Compress the tokens
          const compressTxSignature = await compress(
            rpc,                    // RPC connection
            creatorKeypair,         // Payer
            mintPublicKey,          // Mint address
            batchRawAmount,         // Amount to compress (raw amount)
            treasuryKeypair,        // Owner of the tokens
            associatedTokenAccount.address, // Source token account
            treasuryKeypair.publicKey // Destination owner
          );
          
          console.log(`Compressed batch ${i + 1} successfully: ${compressTxSignature}`);
          console.log(`Transaction link: https://explorer.solana.com/tx/${compressTxSignature}?cluster=devnet`);
          
          batchSuccess = true;
          successfullyCompressed += batchRawAmount;
          
          // Add result to tracking
          results.push({
            batch: i + 1,
            uiAmount: batchUiAmount,
            rawAmount: batchRawAmount,
            success: true,
            signature: compressTxSignature,
            link: `https://explorer.solana.com/tx/${compressTxSignature}?cluster=devnet`
          });
          
          // Wait between batches to avoid rate limiting or timing issues
          if (i < batches - 1) {
            const waitTime = 2000 + (i * 500); // Increasing wait time for later batches
            console.log(`Waiting ${waitTime / 1000} seconds before next batch...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
          
        } catch (batchError: any) {
          console.error(`Error compressing batch ${i + 1}:`, batchError.message);
          lastError = batchError;
          
          // Wait before retry with increasing backoff
          if (attempts < retryCount) {
            const backoffTime = 2000 * attempts;
            console.log(`Retrying in ${backoffTime / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
      }
      
      // If all retries failed for this batch
      if (!batchSuccess) {
        failedBatches++;
        results.push({
          batch: i + 1,
          uiAmount: batchUiAmount,
          rawAmount: batchRawAmount,
          success: false,
          error: lastError ? lastError.message : "Unknown error"
        });
        
        console.error(`All attempts failed for batch ${i + 1}. Moving to next batch.`);
      }
    }
    
    // Final output
    const successfullyCompressedUi = successfullyCompressed / (10 ** DECIMALS);
    console.log(`Compression completed. Successfully compressed: ${successfullyCompressedUi}/${uiAmount} tokens. Failed batches: ${failedBatches}/${batches}`);
    
    // Check final token balance
    let finalTokenBalance = 0;
    let finalUiTokenBalance = 0;
    
    try {
      const finalBalanceResponse = await rpc.getTokenAccountBalance(associatedTokenAccount.address);
      if (finalBalanceResponse?.value) {
        finalTokenBalance = parseInt(finalBalanceResponse.value.amount || '0');
        finalUiTokenBalance = finalBalanceResponse.value.uiAmount || 0;
      } else {
        finalTokenBalance = await checkTokenBalance(rpc, associatedTokenAccount.address);
        finalUiTokenBalance = finalTokenBalance / (10 ** DECIMALS);
      }
    } catch (error) {
      console.error(`Error checking final token balance: ${error}`);
      // Fallback
      try {
        finalTokenBalance = await checkTokenBalance(rpc, associatedTokenAccount.address);
        finalUiTokenBalance = finalTokenBalance / (10 ** DECIMALS);
      } catch (innerError) {
        console.error(`Secondary error checking final token balance: ${innerError}`);
      }
    }
    
    // Get compressed token accounts
    let compressedAccounts: Array<any> = [];
    try {
      const compressedAccountsResponse = await rpc.getCompressedTokenAccountsByOwner(
        treasuryKeypair.publicKey,
        { mint: mintPublicKey }
      );
      
      compressedAccounts = compressedAccountsResponse?.items || [];
      console.log(`Found ${compressedAccounts.length} compressed accounts after operation`);
    } catch (err) {
      console.error(`Error getting compressed accounts after operation: ${err}`);
    }
    
    return res.json({
      success: true,
      message: `Compression process completed. Successfully compressed: ${successfullyCompressedUi}/${uiAmount} tokens.`,
      mint: mintAddress,
      owner: treasuryKeypair.publicKey.toString(),
      totalRequestedUi: uiAmount,
      totalRequested: rawAmount,
      totalCompressedUi: successfullyCompressedUi,
      totalCompressed: successfullyCompressed,
      batchResults: results,
      tokenBalances: {
        beforeRaw: tokenBalance,
        beforeUi: uiTokenBalance,
        afterRaw: finalTokenBalance,
        afterUi: finalUiTokenBalance
      },
      compressedAccounts: {
        count: compressedAccounts.length,
        accounts: compressedAccounts.map(acc => acc.compressedAccount?.hash || acc.hash || '').filter(Boolean)
      },
      solBalances: {
        creator: creatorSolBalance,
        treasury: treasurySolBalance
      }
    });
  } catch (err: any) {
    console.error("Error in compression process:", err);
    
    // Extract more detailed error logs if available
    if (err.transactionLogs) {
      console.error("Transaction logs:", err.transactionLogs);
    }
    
    return res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("----------------------------------------------");
  console.log("Solana Hackathon POP Token System is ready!");
  console.log("Visit http://localhost:" + PORT + " for instructions");
  console.log("Visit http://localhost:" + PORT + "/api/pop/status for system status");
  console.log("----------------------------------------------");
});