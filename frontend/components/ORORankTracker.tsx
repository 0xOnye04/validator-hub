'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Trophy, Star } from 'lucide-react';

interface ORORank {
  id: number;
  validator_address: string;
  moniker: string;
  rank: number;
  voting_power: number;
  score: number;
  timestamp: string;
}

// Official KiiChain Testnet Oro LCD endpoint
const KIICHAIN_LCD_ENDPOINT = 'https://lcd.uno.sentry.testnet.v3.kiivalidator.com';

export default function ORORankTracker() {
  const [ranks, setRanks] = useState<ORORank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealORORanks = async () => {
      try {
        setError(null);
        
        console.log("🔍 Fetching real ORO rank data from KiiChain Testnet Oro API...");
        const response = await fetch(`${KIICHAIN_LCD_ENDPOINT}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED`);
        if (!response.ok) throw new Error('Failed to fetch ORO rank data from KiiChain API');
        
        const data = await response.json();
        console.log("✅ Got real validator data for ORO ranks:", data);
        const validatorsFromApi = data.validators || [];
        
        // Sort validators by real voting power descending (matches explorer order)
        const sortedValidators = [...validatorsFromApi].sort((a, b) => 
          parseInt(b.tokens) - parseInt(a.tokens)
        );
        
        // Transform API data to our format
        const transformedRanks: ORORank[] = sortedValidators.map((v: any, index: number) => ({
          id: index + 1,
          validator_address: v.operator_address,
          moniker: v.description?.moniker || 'Unknown',
          rank: index + 1,
          voting_power: parseInt(v.tokens) / 1000000,
          score: 100 - (index * 1), // Simulated score
          timestamp: new Date().toISOString()
        }));
        
        setRanks(transformedRanks);
        console.log("✅ ORO ranks loaded with real data!", transformedRanks);
      } catch (err) {
        console.error('❌ Error fetching ORO ranks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load ORO ranks');
      } finally {
        setLoading(false);
      }
    };

    fetchRealORORanks();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <ShieldCheck className="w-5 h-5 text-slate-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading real ORO ranks from KiiChain Testnet Oro...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">
          <p className="mb-2">{error}</p>
          <p className="text-sm">Make sure you have an internet connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {ranks.map((rankItem) => (
          <div key={rankItem.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-yellow-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg ${
                  rankItem.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  rankItem.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                  rankItem.rank === 3 ? 'bg-amber-600/20 text-amber-500' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {getRankIcon(rankItem.rank)}
                  <span className="ml-2">#{rankItem.rank}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{rankItem.moniker}</h3>
                  <p className="text-sm text-slate-400 font-mono">{rankItem.validator_address.slice(0,40)}...</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="bg-slate-950 rounded-lg px-4 py-2">
                  <p className="text-xs text-slate-400">Voting Power</p>
                  <p className="text-lg font-bold text-cyan-400">{rankItem.voting_power.toLocaleString()} KII</p>
                </div>
                <div className="bg-slate-950 rounded-lg px-4 py-2">
                  <p className="text-xs text-slate-400">Score</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <p className="text-xl font-bold text-yellow-400">{rankItem.score.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
