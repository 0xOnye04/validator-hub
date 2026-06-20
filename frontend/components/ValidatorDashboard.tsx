'use client';

import { useState, useEffect } from 'react';
import { Activity, Server, Shield, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for demonstration
const mockValidatorData = [
  { height: 1000, votingPower: 1500000, missedBlocks: 0 },
  { height: 2000, votingPower: 1550000, missedBlocks: 0 },
  { height: 3000, votingPower: 1600000, missedBlocks: 1 },
  { height: 4000, votingPower: 1650000, missedBlocks: 0 },
  { height: 5000, votingPower: 1700000, missedBlocks: 0 },
  { height: 6000, votingPower: 1750000, missedBlocks: 0 },
  { height: 7000, votingPower: 1800000, missedBlocks: 0 },
];

const mockBlockProduction = [
  { hour: '00:00', blocks: 120 },
  { hour: '04:00', blocks: 115 },
  { hour: '08:00', blocks: 130 },
  { hour: '12:00', blocks: 145 },
  { hour: '16:00', blocks: 140 },
  { hour: '20:00', blocks: 135 },
];

export default function ValidatorDashboard() {
  const [validators, setValidators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setValidators([
        {
          moniker: 'validKII-1',
          address: 'kiivaloper1abc...',
          votingPower: '1,800,000',
          uptime: '99.9%',
          status: 'active',
          commission: '5%',
        },
        {
          moniker: 'validKII-2',
          address: 'kiivaloper1def...',
          votingPower: '1,200,000',
          uptime: '99.5%',
          status: 'active',
          commission: '6%',
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Voting Power"
          value="3.0M"
          icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
          trend="+2.5%"
          trendUp
        />
        <StatCard
          title="Active Validators"
          value="2"
          icon={<Server className="w-6 h-6 text-cyan-400" />}
          trend="all online"
          trendUp
        />
        <StatCard
          title="Avg Uptime"
          value="99.7%"
          icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
          trend="stable"
          trendUp
        />
        <StatCard
          title="Missed Blocks (24h)"
          value="1"
          icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
          trend="watch closely"
          trendUp={false}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Voting Power Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockValidatorData}>
              <defs>
                <linearGradient id="vpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="height" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000000}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="votingPower" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#vpGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Block Production (24h)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockBlockProduction}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="blocks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Validators List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold">My Validators</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Moniker
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Voting Power
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : (
                validators.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold">
                          {v.moniker[0]}
                        </div>
                        <div>
                          <div className="font-medium">{v.moniker}</div>
                          <div className="text-xs text-slate-500">{v.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">{v.votingPower}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-emerald-400">{v.uptime}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">{v.commission}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string; value: string; icon: any; trend: string; trendUp: boolean }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className={`text-sm ${trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>{trend}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      {children}
    </div>
  );
}
