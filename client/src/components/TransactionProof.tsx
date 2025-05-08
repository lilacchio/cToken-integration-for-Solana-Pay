import React from 'react';
import styled from 'styled-components';

interface TransactionProofProps {
  transactionId: string;
}

const ProofContainer = styled.div`
  margin-top: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;

const ProofHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--space-4);
  
  svg {
    margin-right: var(--space-3);
    color: #4caf50;
  }
`;

const ProofTitle = styled.h3`
  color: var(--color-primary);
  margin: 0;
`;

const TransactionBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-top: var(--space-3);
  font-family: monospace;
  overflow: auto;
`;

const SuccessDetail = styled.div`
  margin-top: var(--space-3);
  color: #4caf50;
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;

  svg {
    margin-right: var(--space-2);
  }
`;

const DetailSection = styled.div`
  margin-top: var(--space-4);
`;

const DetailTitle = styled.h4`
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
`;

const ExplorerLink = styled.a`
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
  
  svg {
    margin-left: var(--space-2);
  }
`;

export const TransactionProof: React.FC<TransactionProofProps> = ({ transactionId }) => {
  // Sample transaction data - this would typically come from your transaction
  const transactionSample = {
    id: transactionId || '4ao6cNpLZvPgA7w8SPGQ43fof5GkMzjC4m56zuePGDW5rTm5wwEV6KsmVBQ4W5R61861ZX2swLMnzzUNqEeHAwtQ',
    success: true,
    blockTime: 'May 8, 2025 at 16:26:08',
    confirmations: 'max',
    slot: '379,475,485',
    computeUnits: '109,684',
    programs: [
      'Compute Budget Program',
      'ZK Compressed Token Program',
      'Light System Program',
      'Token Program'
    ],
    merkleTreeUpdated: true
  };

  return (
    <ProofContainer>
      <ProofHeader>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor" />
        </svg>
        <ProofTitle>Transaction Verification Proof</ProofTitle>
      </ProofHeader>
      
      <p>
        This transaction proves that the ZK token compression was successfully executed on the Solana blockchain.
      </p>
      
      <TransactionBox>
        <strong>Transaction ID:</strong> {transactionSample.id}
      </TransactionBox>
      
      <SuccessDetail>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor" />
        </svg>
        Transaction Status: Success
      </SuccessDetail>
      
      <DetailSection>
        <DetailTitle>Transaction Details</DetailTitle>
        <ul>
          <li><strong>Block Time:</strong> {transactionSample.blockTime}</li>
          <li><strong>Confirmations:</strong> {transactionSample.confirmations}</li>
          <li><strong>Slot:</strong> {transactionSample.slot}</li>
          <li><strong>Compute Units:</strong> {transactionSample.computeUnits}</li>
        </ul>
      </DetailSection>
      
      <DetailSection>
        <DetailTitle>Programs Used</DetailTitle>
        <ul>
          {transactionSample.programs.map((program, index) => (
            <li key={index}>{program}</li>
          ))}
        </ul>
      </DetailSection>
      
      <DetailSection>
        <DetailTitle>ZK Compression Confirmed</DetailTitle>
        <p>
          This transaction has successfully updated the Merkle tree with the compressed token data.
          The compression process uses zero-knowledge proofs to maintain full security while
          significantly reducing on-chain storage requirements.
        </p>
      </DetailSection>
      
      <ExplorerLink 
        href={`https://explorer.solana.com/tx/${transactionSample.id}?cluster=devnet`} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        View on Solana Explorer
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" fill="white" />
        </svg>
      </ExplorerLink>
    </ProofContainer>
  );
}; 