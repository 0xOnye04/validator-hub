import MyPortfolio from '@/components/MyPortfolio';
import { DashboardShell } from '@/components/DashboardShell';

export default function PortfolioPage() {
  return (
    <DashboardShell>
      <MyPortfolio />
    </DashboardShell>
  );
}