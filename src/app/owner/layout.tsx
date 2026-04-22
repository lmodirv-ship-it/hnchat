export const dynamic = 'force-dynamic';

import OwnerLayout from './components/OwnerLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OwnerLayout>{children}</OwnerLayout>;
}
