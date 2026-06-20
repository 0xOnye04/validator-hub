'use client';

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { delegateTokens, fetchValidators, type ValidatorInfo } from '@/utils/staking';
import { KII_DENOM } from '@/utils/kiichain';
import { X, CheckCircle2 } from 'lucide-react';

export default function StakeModal({ isOpen, onClose, validator, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  validator?: string;
  onSuccess: () => void;
}) {
  const { isConnected, address, signerAccount, signingClient, offlineSigner, balances, setError, getSignerAccount } = useWallet();
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<string>(validator || '');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const availableKii = balances[KII_DENOM] || 0;

  const loadValidators = async () => {
    try {
      const vs = await fetchValidators();
      setValidators(vs);
    } catch (e) {
      console.error('Failed to load validators:', e);
    }
  };

  const handleStake = async () => {
    const freshSigner = await getSignerAccount();
    const signerAddress = freshSigner?.address || signerAccount?.address || address;
    if (!isConnected || !signerAddress || !signingClient || !offlineSigner || !selectedValidator || !amount) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <=0) return;
    if (amountNum > availableKii) {
      setError('Amount exceeds available balance');
      return;
    }
    setIsSubmitting(true);
    try {
      console.debug('[KiiChain Tx] stake modal preflight', {
        walletAddress: address,
        cachedSignerAddress: signerAccount?.address || null,
        freshSignerAddress: freshSigner?.address || null,
        signerAddress,
        chainId: 'oro_1336-1',
        cachedSignerPubkey: signerAccount?.pubkey ? Array.from(signerAccount.pubkey).map((byte) => byte.toString(16).padStart(2, '0')).join('') : null,
        freshSignerPubkey: freshSigner?.pubkey ? Array.from(freshSigner.pubkey).map((byte) => byte.toString(16).padStart(2, '0')).join('') : null,
      });
      const res = await delegateTokens(signingClient, offlineSigner, address, signerAddress, selectedValidator, amountNum, freshSigner?.pubkey || signerAccount?.pubkey);
      setTxHash(res.transactionHash);
      setTxSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e) {
      console.error('Stake failed:', e);
      setError(e instanceof Error ? e.message : 'Stake failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setAmount('');
    setSelectedValidator('');
    setTxSuccess(false);
    setTxHash('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Delegate Tokens</h2>
          <button onClick={reset} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {txSuccess ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold text-green-400">Success!</h3>
            <p className="text-slate-400">Transaction: {txHash.slice(0, 20)}...</p>
            <button onClick={reset} className="px-6 py-2 bg-cyan-600 rounded-lg">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Validator</label>
              <select
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                value={selectedValidator}
                onChange={(e) => {
                  setSelectedValidator(e.target.value);
                }}
                onFocus={loadValidators}
              >
                <option value="">Select a validator</option>
                {validators.map((v) => (
                  <option key={v.operatorAddress} value={v.operatorAddress}>{v.moniker} ({(v.commissionRate*100).toFixed(1)}%)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Amount (KII)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  step="0.0001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                />
                <button onClick={() => setAmount(availableKii.toFixed(4))} className="px-3 py-1 bg-slate-700 rounded-lg text-slate-100">Max</button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Available: {availableKii.toFixed(4)} KII</p>
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">
                Cancel
              </button>
              <button
                onClick={handleStake}
                disabled={isSubmitting}
                className="flex-1 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100"
              >
                {isSubmitting ? 'Submitting...' : 'Delegate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
