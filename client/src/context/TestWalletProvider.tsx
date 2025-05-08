import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getSystemStatus } from '../utils/api';

interface WalletInfo {
  address: string;
  solBalance: number;
}

interface TokenInfo {
  mint: string;
  regularTokenBalance: number;
  compressedTokenCount: number;
}

interface TestWalletContextType {
  creatorWallet: WalletInfo | null;
  treasuryWallet: WalletInfo | null;
  tokenInfo: TokenInfo | null;
  currentWallet: string;
  setCurrentWallet: (address: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshWalletData: () => Promise<void>;
}

const TestWalletContext = createContext<TestWalletContextType | undefined>(undefined);

interface TestWalletProviderProps {
  children: ReactNode;
}

export const TestWalletProvider: React.FC<TestWalletProviderProps> = ({ children }) => {
  const [creatorWallet, setCreatorWallet] = useState<WalletInfo | null>(null);
  const [treasuryWallet, setTreasuryWallet] = useState<WalletInfo | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [currentWallet, setCurrentWallet] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch wallet data from the server
  const refreshWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const statusData = await getSystemStatus();
      
      // Update wallet data
      setCreatorWallet(statusData.wallets.creator);
      setTreasuryWallet(statusData.wallets.treasury);
      
      // Update token info if available
      if (statusData.tokens) {
        setTokenInfo({
          mint: statusData.tokens.mint,
          regularTokenBalance: statusData.tokens.regularTokenBalance,
          compressedTokenCount: statusData.tokens.compressedTokenCount
        });
      }
      
      // Set current wallet if not already set
      if (!currentWallet && statusData.wallets.creator.address) {
        setCurrentWallet(statusData.wallets.creator.address);
      }
      
      setIsLoading(false);
    } catch (err: any) {
      setError(`Failed to fetch wallet data: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Load wallet data on mount
  useEffect(() => {
    refreshWalletData();
  }, []);

  return (
    <TestWalletContext.Provider
      value={{
        creatorWallet,
        treasuryWallet,
        tokenInfo,
        currentWallet,
        setCurrentWallet,
        isLoading,
        error,
        refreshWalletData,
      }}
    >
      {children}
    </TestWalletContext.Provider>
  );
};

// Custom hook for using the test wallet context
export const useTestWallet = (): TestWalletContextType => {
  const context = useContext(TestWalletContext);
  if (context === undefined) {
    throw new Error('useTestWallet must be used within a TestWalletProvider');
  }
  return context;
}; 