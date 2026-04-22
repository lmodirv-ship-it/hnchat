'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface EditProfileForm {
  fullName: string;
  username: string;
  bio: string;
  website: string;
  location: string;
  gender: string;
  birthdate: string;
  category: string;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'account' | 'privacy'>('profile');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProfileForm>({
    defaultValues: {
      fullName: '',
      username: '',
      bio: '',
      website: '',
      location: '',
      gender: 'prefer-not',
      birthdate: '',
      category: 'creator',
    },
  });

  // Load real profile data when modal opens
  useEffect(() => {
    if (!open || !user) return;
    const supabase = createClient();
    supabase
      .from('user_profiles')
      .select('full_name, username, bio, website, location')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          reset({
            fullName: data.full_name || '',
            username: data.username || '',
            bio: data.bio || '',
            website: data.website || '',
            location: data.location || '',
            gender: 'prefer-not',
            birthdate: '',
            category: 'creator',
          });
        }
      });
  }, [open, user, reset]);

  const onSubmit = async (data: EditProfileForm) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: data.fullName,
          username: data.username,
          bio: data.bio,
          website: data.website,
          location: data.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: 'profile' as const, label: 'Profile Info', icon: 'UserIcon' },
    { id: 'account' as const, label: 'Account', icon: 'Cog6ToothIcon' },
    { id: 'privacy' as const, label: 'Privacy', icon: 'ShieldCheckIcon' },
  ];

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <Modal open={open} onClose={onClose} title="Edit Profile" size="xl">
        <div className="flex gap-5">
          {/* Section nav */}
          <div className="w-36 flex-shrink-0 space-y-1">
            {sections.map((s) => (
              <button
                key={`edit-sec-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-500 transition-all duration-150 ${
                  activeSection === s.id
                    ? 'text-cyan-glow bg-cyan-glow/08 border border-cyan-glow/15' : 'text-slate-400 hover:bg-white/05 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon name={s.icon as any} size={16} />
                {s.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-w-0">
            {activeSection === 'profile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <input
                      {...register('fullName', { required: 'Full name is required' })}
                      type="text"
                      className="input-glass text-sm"
                    />
                    {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                      <input
                        {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 chars' } })}
                        type="text"
                        className="input-glass pl-7 text-sm"
                      />
                    </div>
                    {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Bio</label>
                  <p className="text-xs text-slate-600 mb-1.5">Tell your audience about yourself. Max 160 characters.</p>
                  <textarea
                    {...register('bio', { maxLength: { value: 160, message: 'Max 160 characters' } })}
                    rows={3}
                    className="input-glass text-sm resize-none"
                  />
                  {errors.bio && <p className="text-xs text-red-400 mt-1">{errors.bio.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Website</label>
                    <input {...register('website')} type="text" className="input-glass text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Location</label>
                    <input {...register('location')} type="text" className="input-glass text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Category</label>
                  <p className="text-xs text-slate-600 mb-1.5">This helps users discover your content.</p>
                  <select {...register('category')} className="input-glass text-sm">
                    <option value="creator">Creator</option>
                    <option value="business">Business</option>
                    <option value="artist">Artist</option>
                    <option value="developer">Developer</option>
                    <option value="gamer">Gamer</option>
                    <option value="musician">Musician</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="input-glass text-sm opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-600 mt-1">Email cannot be changed here. Contact support.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Gender</label>
                    <select {...register('gender')} className="input-glass text-sm">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-slate-400 mb-1.5 uppercase tracking-wide">Birthdate</label>
                    <input {...register('birthdate')} type="date" className="input-glass text-sm" />
                  </div>
                </div>
                <div
                  className="p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <p className="text-sm font-600 text-red-400">Danger Zone</p>
                  <button
                    type="button"
                    className="text-sm font-500 text-red-400 hover:text-red-300 transition-colors duration-150 flex items-center gap-2"
                  >
                    <Icon name="TrashIcon" size={15} />
                    Deactivate Account
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-4">
                {[
                  { label: 'Private Account', desc: 'Only approved followers can see your posts', id: 'priv-private' },
                  { label: 'Activity Status', desc: 'Show when you were last active', id: 'priv-activity' },
                  { label: 'Read Receipts', desc: "Let others see when you've read their messages", id: 'priv-receipts' },
                  { label: 'Tagged Posts', desc: 'Allow others to tag you in posts', id: 'priv-tagged' },
                  { label: 'Story Replies', desc: 'Allow replies to your stories', id: 'priv-stories' },
                ].map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div>
                      <p className="text-sm font-600 text-slate-300">{setting.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{setting.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-5 rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:transition-all duration-200 peer-checked:after:bg-ice-black after:bg-slate-400" style={{ background: 'rgba(255,255,255,0.1)' }} />
                      <style>{`.peer:checked + div { background: linear-gradient(135deg, #6ee7f7, #a78bfa); }`}</style>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/08">
              <button type="button" onClick={onClose} className="btn-glass text-sm">Cancel</button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary text-sm flex items-center gap-2"
                style={{ minWidth: 120 }}
              >
                {isLoading ? (
                  <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                ) : (
                  <>
                    <Icon name="CheckIcon" size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}