'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { fetchValidators, type ValidatorInfo } from '@/utils/staking';

export default function StakingAnalytics() {
  const { stargateClient } = useWallet();
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!stargateClient) {
        setLoading(false);
        return;
      }
      try {
        const vs = await fetchValidators();
        setValidators(vs);
      } catch (e) {
        console.error('Failed to load validators:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stargateClient]);

  const totalStaked = validators.reduce((sum, v) => sum + v.tokens, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading staking analytics...</div>
      </div>
    );
  }

  if (!stargateClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Connect Keplr to view staking analytics.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Staked (All)</h3>
          <p className="text-3xl font-bold text-cyan-400">{totalStaked.toLocaleString()} KII</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Active Validators</h3>
          <p className="text-3xl font-bold text-purple-400">{validators.filter(v => !v.jailed).length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Avg Commission</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {validators.length >0 ? ((validators.reduce((sum, v) => sum + v.commissionRate, 0)/validators.length)*100).toFixed(1) : '0.0'}%
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {validators.slice(0, 10).map((v) => (
          <div key={v.operatorAddress} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{v.moniker}</h3>
                <p className="text-sm text-slate-400 font-mono">{v.operatorAddress.slice(0, 30)}...</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 rounded-lg p-3">
                <p className="text-xs text-slate-400">Total Staked</p>
                <p className="text-lg font-bold text-purple-400">{v.tokens.toLocaleString()} KII</p>
              </div>
              <div className="bg-slate-950 rounded-lg p-3">
                <p className="text-xs text-slate-400">Share</p>
                <p className="text-lg font-bold text-slate-100">{totalStaked >0 ? ((v.tokens/totalStaked)*100).toFixed(2) : '0.00'}%</p>
              </div>
              <div className="bg-slate-950 rounded-lg p-3">
                <p className="text-xs text-slate-400">Commission</p>
                <p className="text-lg font-bold text-yellow-400">{(v.commissionRate * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
