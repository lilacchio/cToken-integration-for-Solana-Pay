import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { mintToTreasury } from '../utils/api';
import { useTestWallet } from '../context/TestWalletProvider';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
`;

const PageTitle = styled(motion.h1)`
  margin-bottom: var(--space-6);
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background-color: var(--color-surface);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const Label = styled.label`
  font-weight: var(--font-weight-medium);
  color: var(--color-on-surface);
`;

const Input = styled.input`
  padding: var(--space-3);
  border: 1px solid var(--color-surface-variant);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
`;

const Description = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-on-surface-muted);
  margin-top: var(--space-1);
`;

const SubmitButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  margin-top: var(--space-2);
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
  
  &:disabled {
    background-color: var(--color-surface-variant);
    cursor: not-allowed;
  }
`;

const StatusContainer = styled.div`
  margin-top: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
`;

const StatusTitle = styled.h3`
  margin-bottom: var(--space-2);
  color: var(--color-primary);
`;

const StatusDetail = styled.div`
  margin-top: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  font-family: monospace;
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-all;
`;

export const MintTokensPage: React.FC = () => {
  const { tokenInfo, refreshWalletData } = useTestWallet();
  const [mintAddress, setMintAddress] = useState(tokenInfo?.mint || '');
  const [quantity, setQuantity] = useState(1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mintAddress) {
      toast.error("Please enter a mint address");
      return;
    }
    
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await mintToTreasury({
        mintAddress,
        quantity
      });
      
      setMintResult(response);
      toast.success(`Successfully minted ${quantity} tokens to treasury!`);
      refreshWalletData();
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      toast.error(`Failed to mint tokens: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Mint Tokens
      </PageTitle>
      
      <FormContainer onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="mintAddress">Mint Address</Label>
          <Input 
            type="text" 
            id="mintAddress"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            placeholder="Enter the mint address"
            required
          />
          <Description>The address of the token mint to which tokens will be minted</Description>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="quantity">Quantity</Label>
          <Input 
            type="number" 
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            placeholder="1000"
            required
          />
          <Description>Number of tokens to mint to the treasury wallet</Description>
        </FormGroup>
        
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Minting..." : "Mint Tokens"}
        </SubmitButton>
      </FormContainer>
      
      {mintResult && (
        <StatusContainer>
          <StatusTitle>Tokens Minted Successfully!</StatusTitle>
          <p>The tokens have been minted to the treasury wallet.</p>
          
          <div>
            <strong>Mint Address:</strong>
            <StatusDetail>{mintResult.mint}</StatusDetail>
          </div>
          
          <div>
            <strong>Transaction:</strong>
            <StatusDetail>{mintResult.mintTransactionSignature}</StatusDetail>
          </div>
          
          <div>
            <strong>Treasury Wallet:</strong>
            <StatusDetail>{mintResult.destination}</StatusDetail>
          </div>
          
          <div>
            <strong>Token Account:</strong>
            <StatusDetail>{mintResult.associatedTokenAccount}</StatusDetail>
          </div>
          
          <div>
            <strong>Quantity:</strong>
            <StatusDetail>{mintResult.amount} tokens</StatusDetail>
          </div>
          
          <div>
            <strong>New Balance:</strong>
            <StatusDetail>{mintResult.newBalance} tokens</StatusDetail>
          </div>
        </StatusContainer>
      )}
    </PageContainer>
  );
}; 