import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Sparkles,
  Save,
  CheckCircle2,
  Plus,
  X,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await api.getUserProfile();
      setProfile(p);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await api.updateUserProfile(profile);
      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || !profile) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  if (loading || !profile) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading user profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <User className="w-7 h-7 text-purple-400" />
          Candidate Career Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your career target, education, preferred job roles, and core skill proficiencies.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="p-6 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Career Objective / Bio</label>
            <textarea
              rows={3}
              value={profile.career_objective}
              onChange={(e) => setProfile({ ...profile, career_objective: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Career & Experience */}
        <div className="p-6 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Placement Target & Seniority
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Level</label>
              <select
                value={profile.experience_level}
                onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="Entry">Entry Level / Graduate (0-1 yrs)</option>
                <option value="Mid-Level">Mid-Level Engineer (2-4 yrs)</option>
                <option value="Senior">Senior Engineer (5+ yrs)</option>
                <option value="Staff / Lead">Staff / Engineering Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Highest Education</label>
              <input
                type="text"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Technical & Core Skills */}
        <div className="p-6 rounded-3xl bg-[#0b1021] border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Verified Skills & Technologies
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. GraphQL, Tailwind, PyTorch)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200 flex items-center gap-2 group hover:border-red-500/30"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-500 group-hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
