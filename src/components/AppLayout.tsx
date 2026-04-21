import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PushPermissionBanner from './PushPermissionBanner';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-ice-black overflow-hidden relative">
      {/* Crystal background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <Sidebar activePath={activePath} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <Topbar />
        <PushPermissionBanner />
        {/* pb-16 on mobile for bottom nav clearance */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}