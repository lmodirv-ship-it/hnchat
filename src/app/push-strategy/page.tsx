import AppLayout from '@/components/AppLayout';
import PushStrategyDashboard from './components/PushStrategyDashboard';

export default function PushStrategyPage() {
  return (
    <AppLayout activePath="/push-strategy">
      <PushStrategyDashboard />
    </AppLayout>
  );
}
