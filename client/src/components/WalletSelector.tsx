import React from 'react';
import styled from 'styled-components';
import { useTestWallet } from '../context/TestWalletProvider';

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

const WalletDropdown = styled.select`
  background-color: var(--color-surface-variant);
  border: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-on-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--color-primary-light);
    color: white;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
`;

const BalanceDisplay = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-on-surface-muted);
`;

export const WalletSelector: React.FC = () => {
  const { 
    creatorWallet, 
    treasuryWallet, 
    currentWallet, 
    setCurrentWallet,
    isLoading
  } = useTestWallet();
  
  if (isLoading) {
    return <SelectorContainer>Loading wallets...</SelectorContainer>;
  }
  
  // Format SOL balance for display
  const getCurrentBalance = () => {
    if (currentWallet === creatorWallet?.address) {
      return creatorWallet.solBalance.toFixed(4);
    } else if (currentWallet === treasuryWallet?.address) {
      return treasuryWallet.solBalance.toFixed(4);
    }
    return '0';
  };
  
  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentWallet(e.target.value);
  };
  
  return (
    <SelectorContainer>
      <WalletDropdown 
        value={currentWallet}
        onChange={handleWalletChange}
      >
        {creatorWallet && (
          <option value={creatorWallet.address}>Creator Wallet</option>
        )}
        {treasuryWallet && (
          <option value={treasuryWallet.address}>Treasury Wallet</option>
        )}
      </WalletDropdown>
      <BalanceDisplay>
        {getCurrentBalance()} SOL
      </BalanceDisplay>
    </SelectorContainer>
  );
}; 