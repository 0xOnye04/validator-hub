'use client';

import { Wallet, LogOut, User, RefreshCw } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { KII_DENOM } from '@/utils/kiichain';

export default function WalletConnect() {
  const { isConnected, isLoading, address, balances, connect, disconnect, refreshBalances } = useWallet();

  const kiiBalance = balances[KII_DENOM] || 0;

  if (isConnected && address) {
    return (
      <div className="bg-slate-800 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-100 text-sm">
                {address.slice(0, 8)}...{address.slice(-8)}
              </p>
              <p className="text-emerald-400 text-xs">
                {kiiBalance.toFixed(4)} KII
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshBalances}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={disconnect}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              title="Disconnect wallet"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={connect}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
      >
        <Wallet className="w-5 h-5" />
        <span>{isLoading ? 'Connecting...' : 'Connect Keplr'}</span>
      </button>
    </div>
  );
}
