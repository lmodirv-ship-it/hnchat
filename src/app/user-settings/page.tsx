import AppLayout from '@/components/AppLayout';
import UserSettingsScreen from './components/UserSettingsScreen';

export default function UserSettingsPage() {
  return (
    <AppLayout activePath="/user-settings">
      <UserSettingsScreen />
    </AppLayout>
  );
}
