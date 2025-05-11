import axios from 'axios';
import { getBaseUrl } from './config';

// Get the base URL from config
const API_BASE_URL = getBaseUrl();

// Types for API requests and responses
export interface CreateTokenRequest {
  name: string;
  symbol: string;
  uri: string;
}

export interface MintToTreasuryRequest {
  mintAddress: string;
  quantity: number;
}

export interface CompressTokensRequest {
  mintAddress: string;
  quantity: number;
  batchSize?: number;
  retryCount?: number;
}

export interface ClaimTokenRequest {
  account: string;
  mintAddress: string;
}

export interface SystemStatusResponse {
  system: {
    rpcUrl: string;
  };
  wallets: {
    creator: {
      address: string;
      solBalance: number;
    };
    treasury: {
      address: string;
      solBalance: number;
    };
  };
  tokens: {
    mint: string;
    treasuryAccounts: {
      regularAccount: string | null;
      compressedAccounts: any[];
    };
    regularTokenBalance: number;
    compressedTokenCount: number;
  } | null;
  environment: {
    nodeEnv: string;
  };
}

// API functions
export const createTokenType = async (data: CreateTokenRequest) => {
  const response = await axios.post(`${API_BASE_URL}/create-type`, data);
  return response.data;
};

export const mintToTreasury = async (data: MintToTreasuryRequest) => {
  const response = await axios.post(`${API_BASE_URL}/mint-to-treasury`, data);
  return response.data;
};

export const compressTokens = async (data: CompressTokensRequest) => {
  const response = await axios.post(`${API_BASE_URL}/compress-tokens`, data);
  return response.data;
};

export const claimToken = async (data: ClaimTokenRequest) => {
  const response = await axios.post(`${API_BASE_URL}/claim`, data);
  return response.data;
};

export const getSystemStatus = async (mintAddress?: string) => {
  const url = mintAddress 
    ? `${API_BASE_URL}/status?mint=${mintAddress}`
    : `${API_BASE_URL}/status`;
  
  const response = await axios.get<SystemStatusResponse>(url);
  return response.data;
}; 