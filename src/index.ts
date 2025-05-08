// @ts-ignore
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createRpc } from "@lightprotocol/stateless.js";
import { Keypair } from '@solana/web3.js';
import { CompressedTokenProgram, transfer } from "@lightprotocol/compressed-token";
import { PublicKey } from "@solana/web3.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Add middleware to parse JSON request bodies
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express server!");
});
app.get("/api/pop/claim", (req: Request, res: Response) => {
  res.json({
    label: "Solana Hackathon POP Claim",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg"
  });
});

app.post("/api/pop/claim", async (req: Request, res: Response) => {
  const { account } = req.body;
  const rpcUrl = process.env.RPC_URL;
  const rpc = createRpc(rpcUrl);
  const mintAddress = "placeholder_mint_address"; // Placeholder for mintAddress
  const amount = 1; // Amount for POP token
  const treasurySecretKey = process.env.TREASURY_WALLET_SECRET_KEY;
  if (!treasurySecretKey) {
    throw new Error("TREASURY_WALLET_SECRET_KEY is not defined in the environment variables.");
  }
  const senderKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(treasurySecretKey)));
  const recipientPubkey = new PublicKey(account);

  try {
    // Use the high-level transfer function that handles proof gathering internally
    const txId = await transfer(
      rpc,                  // RPC connection
      senderKeypair,        // Payer and signer
      new PublicKey(mintAddress), // Mint address
      amount,               // Amount to transfer
      senderKeypair,        // Owner of the tokens (treasury)
      recipientPubkey       // Recipient
    );
    
    console.log("Transfer transaction successful:", txId);
    res.json({ 
      success: true, 
      message: "POP token claimed successfully!",
      transactionId: txId
    });
  } catch (err: any) {
    console.error("Error transferring POP token:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});