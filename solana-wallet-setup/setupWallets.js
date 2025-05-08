const { Keypair, Connection, LAMPORTS_PER_SOL, clusterApiUrl, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58'); // For easily displaying secret keys

// --- Configuration ---
// Replace with your Helius Devnet RPC URL if you have one, otherwise, clusterApiUrl will be used.
// Using Helius is recommended for ZK Compression features later.
const RPC_URL = "https://devnet.helius-rpc.com/?api-key=917dc0b1-b719-46b7-aa4c-6594cc5633d0"; // Or your Helius Devnet RPC URL
const SOL_TO_AIRDROP = 1; // Amount of SOL to airdrop to each wallet (Devnet has limits, usually 1-2 SOL per request)

async function createWalletWithAirdrop(walletName) {
    console.log(`\n--- Creating ${walletName} Wallet ---`);

    // 1. Generate a new Keypair (Wallet)
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey;
    const secretKey = keypair.secretKey; // This is a Uint8Array

    console.log(`Public Key (Address): ${publicKey.toBase58()}`);
    // For.env, you'll typically store the secret key as a base58 encoded string or a byte array string
    console.log(`Secret Key (Uint8Array): [${secretKey.join(',')}]`);
    console.log(`Secret Key (Base58 - for easier import in some wallets/tools): ${(bs58.encode ? bs58.encode(secretKey) : bs58.default.encode(secretKey))}`);

    // 2. Connect to Devnet
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log(`Connecting to Devnet RPC: ${RPC_URL}`);

    // 3. Airdrop Devnet SOL
    console.log(`Requesting ${SOL_TO_AIRDROP} SOL airdrop to ${publicKey.toBase58()}...`);
    try {
        const airdropSignature = await connection.requestAirdrop(
            publicKey,
            SOL_TO_AIRDROP * LAMPORTS_PER_SOL
        );

        // Wait for the airdrop confirmation
        await connection.confirmTransaction({
            signature: airdropSignature,
           ...(await connection.getLatestBlockhash()),
        });

        console.log(`Airdrop successful! Transaction Signature: ${airdropSignature}`);
    } catch (error) {
        console.error(`Airdrop failed for ${walletName} (${publicKey.toBase58()}):`, error.message);
        if (error.message.includes("429")) {
            console.log("This might be due to faucet rate limits. Try again later or with a smaller amount.");
        }
    }

    // 4. Check Balance (optional)
    try {
        const balance = await connection.getBalance(publicKey);
        console.log(`${walletName} Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
        console.error(`Failed to fetch balance for ${walletName}:`, error.message);
    }


    return {
        publicKey: publicKey.toBase58(),
        secretKey_uint8Array: `[${secretKey.join(',')}]`,
        secretKey_base58: (bs58.encode ? bs58.encode(secretKey) : bs58.default.encode(secretKey))
    };
}

async function main() {
    console.log("Starting wallet creation and airdrop process...");

    const creatorWallet = await createWalletWithAirdrop("Creator");
    const treasuryWallet = await createWalletWithAirdrop("Treasury");

    console.log("\n\n--- Summary ---");
    console.log("Creator Wallet:");
    console.log(`  Public Key: ${creatorWallet.publicKey}`);
    console.log(`  Secret Key (for.env as byte array string): CREATOR_WALLET_SECRET_KEY=${creatorWallet.secretKey_uint8Array}`);
    console.log(`  Secret Key (Base58): ${creatorWallet.secretKey_base58}`);


    console.log("\nTreasury Wallet:");
    console.log(`  Public Key: ${treasuryWallet.publicKey}`);
    console.log(`  Secret Key (for.env as byte array string): TREASURY_WALLET_SECRET_KEY=${treasuryWallet.secretKey_uint8Array}`);
    console.log(`  Secret Key (Base58): ${treasuryWallet.secretKey_base58}`);

    console.log("\nIMPORTANT:");
    console.log("1. Save these secret keys securely. They give full control over the wallets.");
    console.log("2. Add the 'Secret Key (for.env as byte array string)' values to your.env file.");
    console.log("   Example.env content:");
    console.log(`   RPC_URL=${RPC_URL}`);
    console.log(`   CREATOR_WALLET_SECRET_KEY=${creatorWallet.secretKey_uint8Array}`);
    console.log(`   TREASURY_WALLET_SECRET_KEY=${treasuryWallet.secretKey_uint8Array}`);
    console.log("   (You'll need to parse these byte array strings back into Uint8Arrays in your main application code)");
}

main().catch(err => {
    console.error("An error occurred:", err);
});