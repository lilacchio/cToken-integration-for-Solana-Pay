import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getSystemStatus } from '../utils/api';
import { useTestWallet } from '../context/TestWalletProvider';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
`;

const PageTitle = styled(motion.h1)`
  margin-bottom: var(--space-6);
`;

const RefreshButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  margin-bottom: var(--space-4);
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
  
  &:disabled {
    background-color: var(--color-surface-variant);
    cursor: not-allowed;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatusCard = styled.div`
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
`;

const CardTitle = styled.h2`
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-surface-variant);
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-surface-variant);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatusLabel = styled.span`
  color: var(--color-on-surface-muted);
`;

const StatusValue = styled.span`
  font-weight: var(--font-weight-medium);
  word-break: break-all;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: var(--space-6);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: var(--space-6);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-error);
  color: var(--color-error);
`;

export const SystemStatusPage: React.FC = () => {
  const { refreshWalletData } = useTestWallet();
  const [statusData, setStatusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSystemStatus();
      setStatusData(data);
      refreshWalletData();
    } catch (err: any) {
      console.error('Error fetching system status:', err);
      setError(`Failed to fetch system status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <PageContainer>
      <PageTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        System Status
      </PageTitle>
      
      <RefreshButton 
        onClick={fetchStatus}
        disabled={isLoading}
      >
        {isLoading ? 'Refreshing...' : 'Refresh Status'}
      </RefreshButton>
      
      {isLoading && <LoadingMessage>Loading system status...</LoadingMessage>}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!isLoading && !error && statusData && (
        <StatusGrid>
          <StatusCard>
            <CardTitle>System Info</CardTitle>
            <StatusRow>
              <StatusLabel>Environment</StatusLabel>
              <StatusValue>{statusData.environment.nodeEnv}</StatusValue>
            </StatusRow>
            <StatusRow>
              <StatusLabel>RPC URL</StatusLabel>
              <StatusValue>{statusData.system.rpcUrl}</StatusValue>
            </StatusRow>
          </StatusCard>
          
          <StatusCard>
            <CardTitle>Wallet Balances</CardTitle>
            <StatusRow>
              <StatusLabel>Creator</StatusLabel>
              <StatusValue>{statusData.wallets.creator.solBalance.toFixed(4)} SOL</StatusValue>
            </StatusRow>
            <StatusRow>
              <StatusLabel>Treasury</StatusLabel>
              <StatusValue>{statusData.wallets.treasury.solBalance.toFixed(4)} SOL</StatusValue>
            </StatusRow>
          </StatusCard>
          
          {statusData.tokens && (
            <>
              <StatusCard>
                <CardTitle>Token Info</CardTitle>
                <StatusRow>
                  <StatusLabel>Mint Address</StatusLabel>
                  <StatusValue>
                    {statusData.tokens.mint.substring(0, 10)}...
                  </StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Regular Balance</StatusLabel>
                  <StatusValue>{statusData.tokens.regularTokenBalance}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Compressed Tokens</StatusLabel>
                  <StatusValue>{statusData.tokens.compressedTokenCount}</StatusValue>
                </StatusRow>
              </StatusCard>
              
              <StatusCard>
                <CardTitle>Token Accounts</CardTitle>
                <StatusRow>
                  <StatusLabel>Regular Account</StatusLabel>
                  <StatusValue>
                    {statusData.tokens.treasuryAccounts.regularAccount ? 
                      `${statusData.tokens.treasuryAccounts.regularAccount.substring(0, 10)}...` : 
                      'None'}
                  </StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Compressed Accounts</StatusLabel>
                  <StatusValue>
                    {statusData.tokens.treasuryAccounts.compressedAccounts.length}
                  </StatusValue>
                </StatusRow>
              </StatusCard>
            </>
          )}
        </StatusGrid>
      )}
    </PageContainer>
  );
}; 