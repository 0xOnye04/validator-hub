'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import type { OfflineDirectSigner, OfflineSigner } from '@cosmjs/proto-signing';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import {
  KII_CHAIN_ID,
  KII_CHAIN_INFO,
  KII_RPC_URL,
  KII_GAS_PRICE,
  ukiiToKii,
} from '@/utils/kiichain';
import { ethsecpAccountParser } from '@/utils/keplr';
import { isOfflineDirectSigner } from '@/utils/keplr';

declare global {
  interface Window extends KeplrWindow {}
}

interface WalletState {
  isConnected: boolean;
  isLoading: boolean;
  address: string | null;
  signerAccount: { address: string; pubkey: Uint8Array } | null;
  balances: { [denom: string]: number };
  stargateClient: StargateClient | null;
  signingClient: SigningStargateClient | null;
  offlineSigner: OfflineDirectSigner | null;
  error: string | null;
}

interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  setError: (err: string | null) => void;
  getSignerAccount: () => Promise<{ address: string; pubkey: Uint8Array } | null>;
}

const WalletContext = createContext<(WalletState & WalletActions) | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [signerAccount, setSignerAccount] = useState<{ address: string; pubkey: Uint8Array } | null>(null);
  const [balances, setBalances] = useState<{ [denom: string]: number }>({});
  const [stargateClient, setStargateClient] = useState<StargateClient | null>(null);
  const [signingClient, setSigningClient] = useState<SigningStargateClient | null>(null);
  const [offlineSigner, setOfflineSigner] = useState<OfflineDirectSigner | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSignerAccount = async () => {
    if (!window.keplr) {
      return null;
    }

    await window.keplr.enable(KII_CHAIN_ID);
    if (!window.getOfflineSignerAuto) {
      throw new Error('getOfflineSignerAuto is not available on the window object');
    }

    const offlineSigner = (await window.getOfflineSignerAuto(KII_CHAIN_ID)) as unknown as OfflineSigner;
    if (!isOfflineDirectSigner(offlineSigner)) {
      throw new Error('Keplr did not provide a direct signer for KiiChain Oro');
    }

    const accounts = await offlineSigner.getAccounts();
    const account = accounts[0];

    if (!account) {
      return null;
    }

    console.debug('[KiiChain Wallet] getSignerAccount()', {
      chainId: KII_CHAIN_ID,
      address: account.address,
      pubkey: formatPubkey(account.pubkey),
      accountCount: accounts.length,
    });

    return { address: account.address, pubkey: account.pubkey };
  };

  useEffect(() => {
    const handleKeplrKeystoreChange = async () => {
      if (localStorage.getItem('kii_wallet_address')) {
        try {
          await connectInternal();
        } catch (e) {
          console.error('Keplr keystore changed and reconnect failed:', e);
          disconnect();
        }
      }
    };

    window.addEventListener('keplr_keystorechange', handleKeplrKeystoreChange);

    // Check if Keplr is available and auto-connect if saved
    const init = async () => {
      if (typeof window !== 'undefined' && window.keplr) {
        const savedAddress = localStorage.getItem('kii_wallet_address');
        if (savedAddress) {
          try {
            await connectInternal();
          } catch (e) {
            console.log('Auto connect failed');
          }
        }
      }
    };
    init();

    return () => {
      window.removeEventListener('keplr_keystorechange', handleKeplrKeystoreChange);
    };
  }, []);

  const connectInternal = async () => {
    if (!window.keplr) {
      throw new Error('Keplr wallet not installed');
    }

    // Suggest chain to Keplr
    await window.keplr.experimentalSuggestChain(KII_CHAIN_INFO);
    await window.keplr.enable(KII_CHAIN_ID);

    // Get accounts
    if (!window.getOfflineSignerAuto) {
      throw new Error('getOfflineSignerAuto is not available on the window object');
    }

    const offlineSigner = (await window.getOfflineSignerAuto(KII_CHAIN_ID)) as unknown as OfflineSigner;
    if (!isOfflineDirectSigner(offlineSigner)) {
      throw new Error('Keplr did not provide a direct signer for KiiChain Oro');
    }

    const accounts = await offlineSigner.getAccounts();
    const account = accounts[0];

    if (!account) {
      throw new Error('No Keplr account available for the selected chain');
    }

    const walletAddress = account.address;

    console.debug('[KiiChain Wallet] connectInternal()', {
      chainId: KII_CHAIN_ID,
      walletAddress,
      pubkey: formatPubkey(account.pubkey),
      accountCount: accounts.length,
    });

    // Create clients
    const stargateCl = await StargateClient.connect(KII_RPC_URL);
    const signingCl = await SigningStargateClient.connectWithSigner(
      KII_RPC_URL,
      offlineSigner,
      {
        gasPrice: KII_GAS_PRICE,
        accountParser: ethsecpAccountParser,
      }
    );

    // Update state
    setAddress(walletAddress);
    setSignerAccount({ address: walletAddress, pubkey: account.pubkey });
    setStargateClient(stargateCl);
    setSigningClient(signingCl);
    setOfflineSigner(offlineSigner);
    setIsConnected(true);
    localStorage.setItem('kii_wallet_address', walletAddress);

    // Load balances
    await refreshBalancesInternal(stargateCl, walletAddress);
  };

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await connectInternal();
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setSignerAccount(null);
    setStargateClient(null);
    setSigningClient(null);
    setOfflineSigner(null);
    setBalances({});
    localStorage.removeItem('kii_wallet_address');
  };

  const refreshBalancesInternal = async (client: StargateClient, addr: string) => {
    const allBalances = await client.getAllBalances(addr);
    const balanceMap: { [denom: string]: number } = {};
    allBalances.forEach((b) => {
      balanceMap[b.denom] = ukiiToKii(b.amount);
    });
    setBalances(balanceMap);
  };

  const refreshBalances = async () => {
    if (!stargateClient || !address) return;
    await refreshBalancesInternal(stargateClient, address);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isLoading,
        address,
        signerAccount,
        balances,
        stargateClient,
        signingClient,
        offlineSigner,
        error,
        connect,
        disconnect,
        refreshBalances,
        setError,
        getSignerAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

function formatPubkey(pubkey: Uint8Array | undefined) {
  if (!pubkey) {
    return null;
  }

  return Array.from(pubkey)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
