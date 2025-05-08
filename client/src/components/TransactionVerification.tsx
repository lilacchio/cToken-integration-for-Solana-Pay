import React from 'react';
import styled from 'styled-components';

interface TransactionProps {
  signature?: string;
  status?: 'success' | 'pending' | 'error';
  type: 'mint' | 'compress' | 'claim';
  amount?: number;
  mintAddress?: string;
}

const VerificationContainer = styled.div`
  margin-top: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-sm);
`;

const SuccessHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--space-3);
  
  svg {
    margin-right: var(--space-2);
    color: #4caf50;
  }
`;

const TransactionDetails = styled.div`
  margin-top: var(--space-3);
  font-size: var(--font-size-sm);
`;

const DetailRow = styled.div`
  display: flex;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-surface-variant);
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  width: 120px;
  color: var(--color-on-surface-muted);
  font-weight: var(--font-weight-medium);
`;

const DetailValue = styled.div`
  font-family: monospace;
  word-break: break-all;
`;

const ExplorerLink = styled.a`
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-3);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-left: var(--space-1);
  }
`;

const TechnicalDetails = styled.details`
  margin-top: var(--space-4);
  
  summary {
    cursor: pointer;
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
  }
  
  div {
    margin-top: var(--space-2);
    padding: var(--space-3);
    background-color: var(--color-surface-variant);
    border-radius: var(--radius-md);
    font-family: monospace;
    font-size: var(--font-size-sm);
    white-space: pre-wrap;
    overflow-x: auto;
  }
`;

export const TransactionVerification: React.FC<TransactionProps> = ({
  signature = '',
  status = 'success',
  type,
  amount = 0,
  mintAddress = ''
}) => {
  const getTransactionTypeLabel = () => {
    switch (type) {
      case 'mint':
        return 'Token Mint';
      case 'compress':
        return 'Token Compression';
      case 'claim':
        return 'Token Claim';
      default:
        return 'Transaction';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'pending':
        return 'Pending';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

  const getTechnicalDescription = () => {
    switch (type) {
      case 'mint':
        return `This transaction minted ${amount} regular SPL tokens to the treasury wallet.
The tokens use a standard SPL token structure with 9 decimal places.`;
      case 'compress':
        return `This transaction compressed ${amount} regular SPL tokens into ZK compressed tokens.
The compression process uses Light Protocol's compression system to:
1. Convert regular SPL tokens into compressed token proofs
2. Store these proofs efficiently in a Merkle tree
3. Reduce on-chain state costs by orders of magnitude
4. Maintain full security guarantees of the Solana blockchain`;
      case 'claim':
        return `This transaction transfers a compressed token to the recipient.
The claim process:
1. Generates a validity proof for the compressed token
2. Transfers ownership in the Merkle tree
3. Requires minimal on-chain storage`;
      default:
        return '';
    }
  };

  return (
    <VerificationContainer>
      <SuccessHeader>
        {status === 'success' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
          </svg>
        )}
        <h3>{getTransactionTypeLabel()} - {getStatusLabel()}</h3>
      </SuccessHeader>
      
      <p>
        {type === 'mint' && `Successfully minted ${amount} tokens to the treasury wallet.`}
        {type === 'compress' && `Successfully compressed ${amount} tokens using ZK compression.`}
        {type === 'claim' && `Successfully generated a claim transaction for the recipient.`}
      </p>
      
      <TransactionDetails>
        <DetailRow>
          <DetailLabel>Transaction</DetailLabel>
          <DetailValue>{signature.substring(0, 12)}...{signature.substring(signature.length - 8)}</DetailValue>
        </DetailRow>
        {mintAddress && (
          <DetailRow>
            <DetailLabel>Mint Address</DetailLabel>
            <DetailValue>{mintAddress.substring(0, 12)}...{mintAddress.substring(mintAddress.length - 8)}</DetailValue>
          </DetailRow>
        )}
        {amount > 0 && (
          <DetailRow>
            <DetailLabel>Amount</DetailLabel>
            <DetailValue>{amount} tokens</DetailValue>
          </DetailRow>
        )}
        <DetailRow>
          <DetailLabel>Status</DetailLabel>
          <DetailValue style={{ color: status === 'success' ? '#4caf50' : status === 'pending' ? '#ff9800' : '#f44336' }}>
            {getStatusLabel()}
          </DetailValue>
        </DetailRow>
      </TransactionDetails>
      
      {signature && (
        <ExplorerLink href={explorerUrl} target="_blank" rel="noopener noreferrer">
          View on Solana Explorer
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" fill="currentColor"/>
          </svg>
        </ExplorerLink>
      )}
      
      <TechnicalDetails>
        <summary>Technical Details</summary>
        <div>{getTechnicalDescription()}</div>
      </TechnicalDetails>
    </VerificationContainer>
  );
}; 