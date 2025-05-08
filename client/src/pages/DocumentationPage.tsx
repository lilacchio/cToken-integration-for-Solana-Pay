import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
`;

const PageTitle = styled(motion.h1)`
  margin-bottom: var(--space-6);
`;

const DocSection = styled.div`
  margin-bottom: var(--space-6);
  background-color: var(--color-surface);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;

const SectionTitle = styled.h2`
  color: var(--color-primary);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-surface-variant);
`;

const SubSectionTitle = styled.h3`
  color: var(--color-primary);
  margin: var(--space-4) 0 var(--space-2) 0;
`;

const EndpointCard = styled.div`
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
`;

const EndpointTitle = styled.h3`
  margin-bottom: var(--space-2);
`;

const Method = styled.span`
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: white;
  margin-right: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
`;

const Endpoint = styled.span`
  font-family: monospace;
  background-color: var(--color-surface);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
`;

const Description = styled.p`
  margin: var(--space-2) 0;
`;

const CodeBlock = styled.pre`
  background-color: var(--color-surface);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-family: monospace;
  font-size: var(--font-size-sm);
  margin: var(--space-2) 0;
`;

const FlowStep = styled.div`
  display: flex;
  margin-bottom: var(--space-4);
  align-items: flex-start;
`;

const StepNumber = styled.div`
  background-color: var(--color-primary);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  margin-right: var(--space-3);
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex-grow: 1;
`;

const InfoBox = styled.div`
  background-color: rgba(25, 118, 210, 0.1);
  border-left: 4px solid #1976d2;
  padding: var(--space-3);
  margin: var(--space-4) 0;
  border-radius: var(--radius-md);
`;

const VerificationBox = styled.div`
  background-color: rgba(0, 200, 83, 0.1);
  border-left: 4px solid #00c853;
  padding: var(--space-3);
  margin: var(--space-4) 0;
  border-radius: var(--radius-md);
`;

export const DocumentationPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Hackathon POP Token System
      </PageTitle>
      
      <DocSection>
        <SectionTitle>About This Project</SectionTitle>
        <p>
          This Proof-of-Participation (POP) token system enables hackathon organizers to create and distribute 
          compressed token proofs using ZK compression technology on Solana, significantly reducing costs and 
          improving scalability.
        </p>
        
        <InfoBox>
          <strong>Hackathon Track Submission:</strong> Best cToken integration for Solana Pay
          <p>This project meets the requirements by:</p>
          <ul>
            <li>Allowing creators to mint experience tokens (cTokens for airdrops)</li>
            <li>Letting attendees claim them by scanning a QR code</li>
            <li>Leveraging ZK compression to reduce costs by orders of magnitude</li>
          </ul>
        </InfoBox>
      </DocSection>
      
      <DocSection>
        <SectionTitle>ZK Compression Technology</SectionTitle>
        <p>
          ZK Compression is a new primitive built on Solana that enables applications to scale efficiently. 
          This system uses ZK compression to:
        </p>
        <ul>
          <li>Reduce on-chain state costs by orders of magnitude</li>
          <li>Preserve Solana's security, performance, and composability</li>
          <li>Enable mass distribution of POP tokens at a fraction of the cost</li>
        </ul>
        
        <SubSectionTitle>How Compression Works</SubSectionTitle>
        <p>
          When tokens are compressed:
        </p>
        <ol>
          <li>Regular SPL tokens are first minted to a treasury wallet</li>
          <li>The compression process converts these into compressed token proofs</li>
          <li>These proofs are stored in an efficient Merkle tree structure</li>
          <li>When claimed, validity proofs ensure the transaction integrity</li>
        </ol>
        
        <VerificationBox>
          <strong>Verification:</strong> You can verify token compression is working by:
          <ul>
            <li>Creating a token, minting regular tokens, then compressing them</li>
            <li>Checking transaction confirmations on Solana Explorer</li>
            <li>Observing the system status page showing token balances</li>
            <li>Using the API endpoints below to interact with compressed tokens</li>
          </ul>
          <p>
            <strong>Note:</strong> While compressed tokens may not always appear instantly in wallets due to 
            indexer delays, the Solana Explorer will confirm the compression operations are successful.
          </p>
        </VerificationBox>
      </DocSection>
      
      <DocSection>
        <SectionTitle>Complete Workflow</SectionTitle>
        
        <FlowStep>
          <StepNumber>1</StepNumber>
          <StepContent>
            <strong>Create a Token Type</strong>
            <p>First, create a new POP token that will be used for the hackathon.</p>
            <CodeBlock>{`POST /api/pop/create-type
{
  "name": "Solana Hackathon POP",
  "symbol": "POP",
  "uri": "https://solana.com/pop-metadata.json"
}`}</CodeBlock>
          </StepContent>
        </FlowStep>
        
        <FlowStep>
          <StepNumber>2</StepNumber>
          <StepContent>
            <strong>Mint Tokens to Treasury</strong>
            <p>Next, mint regular SPL tokens to the treasury wallet.</p>
            <CodeBlock>{`POST /api/pop/mint-to-treasury
{
  "mintAddress": "YOUR_MINT_ADDRESS",
  "quantity": 100
}`}</CodeBlock>
          </StepContent>
        </FlowStep>
        
        <FlowStep>
          <StepNumber>3</StepNumber>
          <StepContent>
            <strong>Compress Tokens</strong>
            <p>Now, compress the SPL tokens to create compressed tokens.</p>
            <CodeBlock>{`POST /api/pop/compress-tokens
{
  "mintAddress": "YOUR_MINT_ADDRESS",
  "quantity": 50,
  "batchSize": 10
}`}</CodeBlock>
            <p>Tip: Compression is processed in batches for optimal reliability.</p>
          </StepContent>
        </FlowStep>
        
        <FlowStep>
          <StepNumber>4</StepNumber>
          <StepContent>
            <strong>Generate QR Code for Claiming</strong>
            <p>At an event, generate QR codes that attendees can scan to claim their tokens.</p>
            <CodeBlock>{`POST /api/pop/claim
{
  "account": "RECIPIENT_WALLET_ADDRESS",
  "mintAddress": "YOUR_MINT_ADDRESS"
}`}</CodeBlock>
            <p>This returns a transaction that the attendee signs to claim their token.</p>
          </StepContent>
        </FlowStep>
      </DocSection>
      
      <DocSection>
        <SectionTitle>API Endpoints</SectionTitle>
        
        <EndpointCard>
          <EndpointTitle>
            <Method>GET</Method>
            <Endpoint>/api/pop/status</Endpoint>
          </EndpointTitle>
          <Description>
            Retrieves the current system status, including wallet balances and token information.
          </Description>
          <h4>Query Parameters</h4>
          <CodeBlock>{`mint (optional) - The mint address to get token information for`}</CodeBlock>
          <h4>Response Example</h4>
          <CodeBlock>{`{
  "system": {
    "rpcUrl": "https://api.devnet.solana..."
  },
  "wallets": {
    "creator": {
      "address": "CreatorWalletAddress123",
      "solBalance": 0.5
    },
    "treasury": {
      "address": "TreasuryWalletAddress123",
      "solBalance": 1.2
    }
  },
  "tokens": {
    "mint": "MintAddress123",
    "treasuryAccounts": {
      "regularAccount": "TokenAccount123",
      "compressedAccounts": []
    },
    "regularTokenBalance": 100,
    "compressedTokenCount": 50
  },
  "environment": {
    "nodeEnv": "development"
  }
}`}</CodeBlock>
        </EndpointCard>
        
        <EndpointCard>
          <EndpointTitle>
            <Method>POST</Method>
            <Endpoint>/api/pop/create-type</Endpoint>
          </EndpointTitle>
          <Description>
            Creates a new token type (mint) for proof-of-participation.
          </Description>
          <h4>Request Body</h4>
          <CodeBlock>{`{
  "name": "Solana Hackathon POP",
  "symbol": "POP",
  "uri": "https://solana.com/pop-metadata.json"
}`}</CodeBlock>
        </EndpointCard>
        
        <EndpointCard>
          <EndpointTitle>
            <Method>POST</Method>
            <Endpoint>/api/pop/mint-to-treasury</Endpoint>
          </EndpointTitle>
          <Description>
            Mints regular SPL tokens to the treasury wallet.
          </Description>
          <h4>Request Body</h4>
          <CodeBlock>{`{
  "mintAddress": "MintAddress123",
  "quantity": 1000
}`}</CodeBlock>
        </EndpointCard>
        
        <EndpointCard>
          <EndpointTitle>
            <Method>POST</Method>
            <Endpoint>/api/pop/compress-tokens</Endpoint>
          </EndpointTitle>
          <Description>
            Compresses regular SPL tokens into ZK compressed tokens.
          </Description>
          <h4>Request Body</h4>
          <CodeBlock>{`{
  "mintAddress": "MintAddress123",
  "quantity": 100,
  "batchSize": 10,
  "retryCount": 3
}`}</CodeBlock>
        </EndpointCard>
        
        <EndpointCard>
          <EndpointTitle>
            <Method>POST</Method>
            <Endpoint>/api/pop/claim</Endpoint>
          </EndpointTitle>
          <Description>
            Claims a compressed token to a recipient wallet.
          </Description>
          <h4>Request Body</h4>
          <CodeBlock>{`{
  "account": "RecipientWalletAddress123", 
  "mintAddress": "MintAddress123"
}`}</CodeBlock>
        </EndpointCard>
      </DocSection>
    </PageContainer>
  );
}; 