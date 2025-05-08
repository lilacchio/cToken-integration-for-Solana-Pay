import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { createTokenType } from '../utils/api';
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

interface FormValues {
  name: string;
  symbol: string;
  uri: string;
}

interface TokenCreationResponse {
  success: boolean;
  message: string;
  mintAddress: string;
  transactionSignature: string;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
  };
}

export const CreateTokenPage: React.FC = () => {
  const { refreshWalletData } = useTestWallet();
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    symbol: '',
    uri: 'https://solana.com/pop-metadata.json'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creationResult, setCreationResult] = useState<TokenCreationResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formValues.name || !formValues.symbol || !formValues.uri) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await createTokenType(formValues);
      setCreationResult(response);
      toast.success('Token type created successfully!');
      refreshWalletData(); // Refresh wallet data to show new token
    } catch (error: any) {
      console.error('Error creating token:', error);
      toast.error(`Failed to create token: ${error.response?.data?.error || error.message}`);
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
        Create Token
      </PageTitle>
      
      <FormContainer onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Token Name</Label>
          <Input 
            type="text" 
            id="name"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            placeholder="Solana Hackathon POP"
            required
          />
          <Description>The display name for your token (e.g., "Solana Hackathon POP")</Description>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="symbol">Token Symbol</Label>
          <Input 
            type="text" 
            id="symbol"
            name="symbol"
            value={formValues.symbol}
            onChange={handleChange}
            placeholder="POP"
            maxLength={10}
            required
          />
          <Description>A short symbol for your token (e.g., "POP")</Description>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="uri">Metadata URI</Label>
          <Input 
            type="url" 
            id="uri"
            name="uri"
            value={formValues.uri}
            onChange={handleChange}
            placeholder="https://solana.com/pop-metadata.json"
            required
          />
          <Description>URL to the token's metadata JSON file</Description>
        </FormGroup>
        
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Token...' : 'Create Token'}
        </SubmitButton>
      </FormContainer>
      
      {creationResult && (
        <StatusContainer>
          <StatusTitle>Token Created Successfully!</StatusTitle>
          <p>Your new token has been created on the Solana blockchain.</p>
          
          <div>
            <strong>Mint Address:</strong>
            <StatusDetail>{creationResult.mintAddress}</StatusDetail>
          </div>
          
          <div>
            <strong>Transaction:</strong>
            <StatusDetail>{creationResult.transactionSignature}</StatusDetail>
          </div>
        </StatusContainer>
      )}
    </PageContainer>
  );
}; 