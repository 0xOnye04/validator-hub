'use client';

import { useState, useEffect } from 'react';
import { Server, CheckCircle2, XCircle } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { fetchValidators, type ValidatorInfo } from '@/utils/staking';
import StakeModal from '@/components/StakeModal';

export default function ValidatorsList() {
  const { stargateClient, isConnected } = useWallet();
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [stakeModal, setStakeModal] = useState<{ isOpen: boolean; validator?: string }>({ isOpen: false });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading validators from KiiChain...</div>
      </div>
    );
  }

  if (!stargateClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Connect Keplr to load validators from KiiChain.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {validators.map((v) => (
          <div key={v.operatorAddress} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{v.moniker}</h3>
                  <p className="text-sm text-slate-400 font-mono">{v.operatorAddress.slice(0, 40)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {v.jailed ? (
                  <span className="flex items-center gap-2 text-red-400 text-sm font-medium">
                    <XCircle className="w-4 h-4" /> Jailed
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Active
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 rounded-lg p-3">
                <p className="text-xs text-slate-400">Voting Power</p>
                <p className="text-lg font-bold text-cyan-400">{v.tokens.toLocaleString()} KII</p>
              </div>
              <div className="bg-slate-950 rounded-lg p-3">
                <p className="text-xs text-slate-400">Commission</p>
                <p className="text-lg font-bold text-yellow-400">{(v.commissionRate * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-slate-950 rounded-lg p-3">
                <p className="text-xs text-slate-400">Max Commission</p>
                <p className="text-lg font-bold text-slate-100">{(v.maxCommissionRate * 100).toFixed(1)}%</p>
              </div>
              {isConnected && !v.jailed && (
                <div className="bg-slate-950 rounded-lg p-3 flex items-end justify-center">
                  <button
                    onClick={() => setStakeModal({ isOpen: true, validator: v.operatorAddress })}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-medium"
                  >
                    Delegate
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <StakeModal
        isOpen={stakeModal.isOpen}
        onClose={() => setStakeModal({ isOpen: false })}
        validator={stakeModal.validator}
        onSuccess={() => {}}
      />
    </div>
  );
}
