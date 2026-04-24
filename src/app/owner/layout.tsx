import OwnerLayout from './components/OwnerLayout';

export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OwnerLayout>{children}</OwnerLayout>;
}
