import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { claimToken } from '../utils/api';
import { useTestWallet } from '../context/TestWalletProvider';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
`;

const PageTitle = styled(motion.h1)`
  margin-bottom: var(--space-6);
`;

const ClaimContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
`;

const ClaimCard = styled.div`
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
`;

const CardTitle = styled.h2`
  margin-bottom: var(--space-4);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
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

const Button = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
  
  &:disabled {
    background-color: var(--color-surface-variant);
    cursor: not-allowed;
  }
`;

const QrScanArea = styled.div`
  margin-top: var(--space-4);
  padding: var(--space-4);
  border: 2px dashed var(--color-primary-light);
  border-radius: var(--radius-md);
  text-align: center;
`;

const QrImagePlaceholder = styled.div`
  width: 250px;
  height: 250px;
  margin: 0 auto;
  background-color: var(--color-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
`;

const TransactionDetails = styled.div`
  margin-top: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-success);
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-3);
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const DetailLabel = styled.span`
  font-weight: var(--font-weight-medium);
  min-width: 120px;
  margin-right: var(--space-2);
`;

const DetailValue = styled.span`
  font-family: monospace;
  word-break: break-all;
`;

export const ClaimTokensPage: React.FC = () => {
  const { currentWallet, refreshWalletData } = useTestWallet();
  const [mintAddress, setMintAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);

  const handleClaim = async () => {
    if (!mintAddress) {
      toast.error('Please enter a mint address');
      return;
    }

    if (!currentWallet) {
      toast.error('Please select a wallet first');
      return;
    }

    try {
      setIsLoading(true);
      const response = await claimToken({
        account: currentWallet,
        mintAddress
      });

      setTransactionData(response);
      toast.success('Token claimed successfully!');
      refreshWalletData();
    } catch (error: any) {
      console.error('Error claiming token:', error);
      toast.error(`Failed to claim token: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Example QR code data - in a real app, this would come from scanning
  const simulateQrScan = () => {
    // For the demo, we just hardcode a mint address
    setMintAddress('DemoMintAddress123456789AbcdefGhijklmnopQrsTuvwxYZ');
    toast.info('QR code scanned successfully!');
  };

  return (
    <PageContainer>
      <PageTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Claim Tokens
      </PageTitle>
      
      <ClaimContainer>
        <ClaimCard>
          <CardTitle>Scan QR Code</CardTitle>
          <p>Scan a QR code from a token issuer to claim your POP token.</p>
          
          <QrScanArea>
            <QrImagePlaceholder>
              <p>Camera access would appear here</p>
            </QrImagePlaceholder>
            <Button onClick={simulateQrScan}>
              Simulate QR Scan
            </Button>
          </QrScanArea>
        </ClaimCard>
        
        <ClaimCard>
          <CardTitle>Manual Claim</CardTitle>
          <p>Enter the mint address to claim your token.</p>
          
          <FormGroup>
            <Label htmlFor="mintAddress">Mint Address</Label>
            <Input
              type="text"
              id="mintAddress"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              placeholder="Enter the token mint address"
            />
            <Description>The address of the token mint you want to claim</Description>
          </FormGroup>
          
          <Button 
            onClick={handleClaim}
            disabled={isLoading || !mintAddress}
          >
            {isLoading ? 'Claiming...' : 'Claim Token'}
          </Button>
        </ClaimCard>
        
        {transactionData && (
          <TransactionDetails>
            <h3>Token Claimed Successfully!</h3>
            <p>Your compressed token has been claimed. The transaction details are below:</p>
            
            <DetailRow>
              <DetailLabel>Mint:</DetailLabel>
              <DetailValue>{transactionData.mint}</DetailValue>
            </DetailRow>
            
            <DetailRow>
              <DetailLabel>Transaction:</DetailLabel>
              <DetailValue>
                {transactionData.transaction ? 
                  (typeof transactionData.transaction === 'string' ? 
                    transactionData.transaction.substring(0, 20) + '...' : 
                    'Transaction data available') : 
                  'N/A'}
              </DetailValue>
            </DetailRow>
            
            <p style={{ marginTop: 'var(--space-4)' }}>
              You can now see this token in your wallet!
            </p>
          </TransactionDetails>
        )}
      </ClaimContainer>
    </PageContainer>
  );
}; 