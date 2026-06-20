'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Gift,
  LayoutDashboard,
  Server,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';
import { useWallet } from '@/context/WalletContext';

type NavIcon = typeof LayoutDashboard;

type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
};

const navItems: NavItem[] = [
  { href: '/portfolio', label: 'My Portfolio', icon: LayoutDashboard },
  { href: '/validators', label: 'Validators', icon: Server },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: '/analytics', label: 'Staking Analytics', icon: TrendingUp },
  { href: '/oro', label: 'ORO Rank', icon: ShieldCheck },
];

const pageMeta: Record<string, { title: string; description: string }> = {
  '/portfolio': {
    title: 'My Portfolio',
    description: 'Track delegated KII, unbonding entries, and wallet balance in one place.',
  },
  '/validators': {
    title: 'Validators',
    description: 'Review the live bonded set and delegate directly from the validator directory.',
  },
  '/rewards': {
    title: 'Rewards',
    description: 'Inspect and claim your available staking rewards across validators.',
  },
  '/analytics': {
    title: 'Staking Analytics',
    description: 'Monitor validator concentration, active set health, and commission levels.',
  },
  '/oro': {
    title: 'ORO Rank',
    description: 'View the current validator ordering on KiiChain Testnet Oro.',
  },
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { error, setError } = useWallet();
  const currentPage = pageMeta[pathname] || pageMeta['/portfolio'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_26%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative flex min-h-screen">
        <aside className="flex w-80 flex-col border-r border-white/8 bg-slate-950/70 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/8 px-6 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-lg font-semibold text-white shadow-lg shadow-cyan-500/20">
              K
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">KiiChain</p>
              <h1 className="text-xl font-semibold text-white">Staking Hub</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                    active
                      ? 'border-cyan-400/30 bg-cyan-400/10 text-white shadow-lg shadow-cyan-500/10'
                      : 'border-transparent text-slate-400 hover:border-white/8 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ArrowRight className={`h-4 w-4 transition-transform ${active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'}`} />
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/8 p-4">
            <WalletConnect />
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-white/8 bg-slate-950/55 px-6 py-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-2 text-slate-300 shadow-inner shadow-black/10">
                {pathname === '/rewards' ? <Gift className="h-5 w-5" /> : pathname === '/validators' ? <Server className="h-5 w-5" /> : pathname === '/analytics' ? <TrendingUp className="h-5 w-5" /> : pathname === '/oro' ? <ShieldCheck className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">KiiChain Testnet Oro</p>
                <h2 className="text-2xl font-semibold text-white">{currentPage.title}</h2>
              </div>
            </div>
          </header>

          <div className="px-6 pt-6">
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/8 px-5 py-4 shadow-lg shadow-cyan-500/5">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Live staking workspace</p>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">{currentPage.description}</p>
            </div>
          </div>

          {error && (
            <div className="px-6 pt-4">
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-100">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                <div className="flex-1 text-sm">{error}</div>
                <button onClick={() => setError(null)} className="rounded-full p-1 text-red-100/80 transition hover:bg-red-500/20 hover:text-white" aria-label="Dismiss error">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto px-6 py-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}