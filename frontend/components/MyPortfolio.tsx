'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { fetchDelegations, fetchUnbondingDelegations, type Delegation, type UnbondingDelegation } from '@/utils/staking';
import { KII_DENOM } from '@/utils/kiichain';
import { RefreshCw, Server, Clock } from 'lucide-react';
import StakeModal from '@/components/StakeModal';
import UnstakeModal from '@/components/UnstakeModal';
import RedelegateModal from '@/components/RedelegateModal';

export default function MyPortfolio() {
  const { isConnected, address, stargateClient, refreshBalances, balances } = useWallet();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [unbondings, setUnbondings] = useState<UnbondingDelegation[]>([]);
  const [loading, setLoading] = useState(false);
  const [stakeModal, setStakeModal] = useState<{ isOpen: boolean; validator?: string }>({ isOpen: false });
  const [unstakeModal, setUnstakeModal] = useState<{ isOpen: boolean; validator?: string; maxAmount?: number }>({ isOpen: false });
  const [redelegateModal, setRedelegateModal] = useState<{ isOpen: boolean; srcValidator?: string; maxAmount?: number }>({ isOpen: false });

  const loadPortfolio = async () => {
    if (!isConnected || !address || !stargateClient) return;
    setLoading(true);
    try {
      const [degs, unbonds] = await Promise.all([
        fetchDelegations(address),
        fetchUnbondingDelegations(address),
      ]);
      setDelegations(degs);
      setUnbondings(unbonds);
    } catch (e) {
      console.error('Failed to load portfolio:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, [isConnected, address, stargateClient]);

  const totalDelegated = delegations.reduce((sum, d) => sum + d.balance, 0);
  const totalUnbonding = unbondings.reduce((sum, u) => sum + u.entries.reduce((s, e) => s + e.balance, 0), 0);
  const totalStaked = totalDelegated + totalUnbonding;
  const availableKii = balances[KII_DENOM] || 0;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-xl text-slate-400 mb-4">Connect your wallet to view your portfolio</p>
      </div>
    );
  }

  if (!stargateClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-xl text-slate-400 mb-4">Connect Keplr to load your staking portfolio</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Available Balance</h3>
          <p className="text-3xl font-bold text-cyan-400">{availableKii.toFixed(4)} KII</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Staked</h3>
          <p className="text-3xl font-bold text-purple-400">{totalStaked.toFixed(4)} KII</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Unbonding</h3>
          <p className="text-3xl font-bold text-orange-400">{totalUnbonding.toFixed(4)} KII</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => { loadPortfolio(); refreshBalances(); }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Delegations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Delegations</h2>
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : delegations.length === 0 ? (
          <p className="text-slate-400">No delegations yet</p>
        ) : (
          <div className="space-y-4">
            {delegations.map((d) => (
              <div key={d.validatorAddress} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{d.validatorAddress.slice(0, 24)}...</p>
                    <p className="text-sm text-slate-400">{d.balance.toFixed(4)} KII</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStakeModal({ isOpen: true, validator: d.validatorAddress })} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm">Stake</button>
                  <button onClick={() => setUnstakeModal({ isOpen: true, validator: d.validatorAddress, maxAmount: d.balance })} className="px-3 py-1 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm">Unstake</button>
                  <button onClick={() => setRedelegateModal({ isOpen: true, srcValidator: d.validatorAddress, maxAmount: d.balance })} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">Redelegate</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unbonding Delegations */}
      {unbondings.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Unbonding</h2>
          <div className="space-y-4">
            {unbondings.map((u) =>
              u.entries.map((entry, idx) => (
                <div key={`${u.validatorAddress}-${idx}`} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{u.validatorAddress.slice(0, 24)}...</p>
                      <p className="text-sm text-orange-400">{entry.balance.toFixed(4)} KII</p>
                      <p className="text-xs text-slate-400">Available: {entry.completionTime.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <StakeModal
        isOpen={stakeModal.isOpen}
        onClose={() => setStakeModal({ isOpen: false })}
        validator={stakeModal.validator}
        onSuccess={loadPortfolio}
      />
      <UnstakeModal
        isOpen={unstakeModal.isOpen}
        onClose={() => setUnstakeModal({ isOpen: false })}
        validator={unstakeModal.validator}
        maxAmount={unstakeModal.maxAmount}
        onSuccess={loadPortfolio}
      />
      <RedelegateModal
        isOpen={redelegateModal.isOpen}
        onClose={() => setRedelegateModal({ isOpen: false })}
        srcValidator={redelegateModal.srcValidator}
        maxAmount={redelegateModal.maxAmount}
        onSuccess={loadPortfolio}
      />
    </div>
  );
}
