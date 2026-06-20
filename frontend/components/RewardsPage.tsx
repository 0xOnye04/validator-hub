'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { fetchRewards, claimRewards, type ValidatorInfo, fetchValidators } from '@/utils/staking';
import { RefreshCw, Gift, CheckCircle2, X } from 'lucide-react';

export default function RewardsPage() {
  const { isConnected, address, signerAccount, stargateClient, signingClient, offlineSigner, setError, refreshBalances, getSignerAccount } = useWallet();
  const [rewards, setRewards] = useState<{ validatorAddress: string; amount: number; validator?: ValidatorInfo }[]>([]);
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!isConnected || !address || !stargateClient) return;
    setLoading(true);
    try {
      const [rws, vs] = await Promise.all([
        fetchRewards(address),
        fetchValidators(),
      ]);
      setValidators(vs);
      const rewardsWithVal = rws.map(r => {
        const val = vs.find(v => v.operatorAddress === r.validatorAddress);
        return { ...r, validator: val };
      });
      setRewards(rewardsWithVal);
      setSelectedRewards(rewardsWithVal.map(r => r.validatorAddress));
    } catch (e) {
      console.error('Failed to load rewards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isConnected, address, stargateClient]);

  const toggleReward = (addr: string) => {
    if (selectedRewards.includes(addr)) {
      setSelectedRewards(selectedRewards.filter(a => a !== addr));
    } else {
      setSelectedRewards([...selectedRewards, addr]);
    }
  };

  const claimSelectedRewards = async () => {
    const freshSigner = await getSignerAccount();
    const signerAddress = freshSigner?.address || signerAccount?.address || address;
    if (!isConnected || !signerAddress || !signingClient || !offlineSigner || selectedRewards.length === 0) return;
    setIsSubmitting(true);
    try {
      console.debug('[KiiChain Tx] claim rewards preflight', {
        walletAddress: address,
        cachedSignerAddress: signerAccount?.address || null,
        freshSignerAddress: freshSigner?.address || null,
        signerAddress,
        chainId: 'oro_1336-1',
        cachedSignerPubkey: signerAccount?.pubkey ? Array.from(signerAccount.pubkey).map((byte) => byte.toString(16).padStart(2, '0')).join('') : null,
        freshSignerPubkey: freshSigner?.pubkey ? Array.from(freshSigner.pubkey).map((byte) => byte.toString(16).padStart(2, '0')).join('') : null,
        validatorAddresses: selectedRewards,
      });
      const res = await claimRewards(signingClient, offlineSigner, address, signerAddress, selectedRewards, freshSigner?.pubkey || signerAccount?.pubkey);
      setTxHash(res.transactionHash);
      setTxSuccess(true);
      setTimeout(() => {
        loadData();
        refreshBalances();
        setTxSuccess(false);
        setTxHash('');
      }, 2500);
    } catch (e) {
      console.error('Claim failed:', e);
      setError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Gift className="w-16 h-16 text-slate-500 mb-4" />
        <p className="text-xl text-slate-400 mb-4">Connect your wallet to view rewards</p>
      </div>
    );
  }

  if (!stargateClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Gift className="w-16 h-16 text-slate-500 mb-4" />
        <p className="text-xl text-slate-400 mb-4">Connect Keplr to load rewards</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {txSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-400 mb-2">Rewards Claimed!</h3>
            <p className="text-slate-400 mb-4">Transaction: {txHash.slice(0, 30)}...</p>
            <button onClick={() => setTxSuccess(false)} className="px-6 py-2 bg-cyan-600 rounded-lg text-white">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm font-medium mb-2">Total Rewards</h3>
          <p className="text-3xl font-bold text-yellow-400">{totalRewards.toFixed(4)} KII</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-2">Selected Rewards</h3>
            <p className="text-xl font-bold text-cyan-400">{selectedRewards.length} validators</p>
          </div>
          <button
            onClick={loadData}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {selectedRewards.length > 0 && (
        <button
          onClick={claimSelectedRewards}
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold"
        >
          {isSubmitting ? 'Claiming...' : `Claim ${selectedRewards.length} Reward${selectedRewards.length >1 ? 's' : ''}`}
        </button>
      )}

      {/* Rewards List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Rewards by Validator</h2>
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : rewards.length === 0 ? (
          <p className="text-slate-400">No rewards available to claim</p>
        ) : (
          <div className="space-y-4">
            {rewards.map((r) => (
              <div key={r.validatorAddress} className="flex items-center justify-between p-4 bg-slate-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedRewards.includes(r.validatorAddress)}
                    onChange={() => toggleReward(r.validatorAddress)}
                    className="w-5 h-5 text-cyan-600 bg-slate-800 border-slate-700"
                  />
                  <div>
                    <p className="text-white font-medium">{r.validator?.moniker || r.validatorAddress.slice(0, 20)}</p>
                    <p className="text-sm text-slate-400">{r.validatorAddress.slice(0, 30)}...</p>
                  </div>
                </div>
                <p className="text-yellow-400 font-bold">{r.amount.toFixed(4)} KII</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
