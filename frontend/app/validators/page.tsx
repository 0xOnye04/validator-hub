import ValidatorsList from '@/components/ValidatorsList';
import { DashboardShell } from '@/components/DashboardShell';

export default function ValidatorsPage() {
  return (
    <DashboardShell>
      <ValidatorsList />
    </DashboardShell>
  );
}