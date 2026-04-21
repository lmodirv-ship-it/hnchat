'use client';
import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import EditProfileModal from './EditProfileModal';

export default function ProfileScreen() {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="max-w-screen-2xl mx-auto pb-24 lg:pb-6">
      <ProfileHeader onEdit={() => setEditOpen(true)} />
      <div className="px-4 lg:px-8 xl:px-10">
        <ProfileTabs />
      </div>
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}