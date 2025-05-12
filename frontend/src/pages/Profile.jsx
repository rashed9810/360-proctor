import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@example.com',
    bio: user?.bio || 'System administrator with full access to all features.',
  });
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || '/assets/images/default-avatar.svg'
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [bioCount, setBioCount] = useState(formData.bio.length);
  const fileInputRef = useRef();
  const autosaveTimeout = useRef();

  // Dynamic role badge
  const roleMap = {
    admin: { label: 'Administrator', color: 'bg-green-100 text-green-800' },
    moderator: { label: 'Moderator', color: 'bg-blue-100 text-blue-800' },
    user: { label: 'User', color: 'bg-gray-100 text-gray-800' },
  };
  const userRole = user?.role || 'admin';
  const roleBadge = roleMap[userRole] || roleMap['user'];

  // Autosave logic
  useEffect(() => {
    if (unsaved) {
      toast.dismiss('unsaved');
      toast('You have unsaved changes', { id: 'unsaved', icon: '⚠️' });
    }
    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    autosaveTimeout.current = setTimeout(() => {
      if (unsaved) handleAutosave();
    }, 2000);
    return () => clearTimeout(autosaveTimeout.current);
  }, [formData]);

  const handleAutosave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setUnsaved(false);
      toast.success('Profile autosaved');
    }, 1000);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'bio') {
      if (value.length > 200) return;
      setBioCount(value.length);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setUnsaved(true);
  };

  // Convert file to base64
  const fileToBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Avatar change logic
  const handleAvatarClick = () => fileInputRef.current.click();
  const handleAvatarSelect = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAvatarError('Only JPEG and PNG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File size must be less than 5MB.');
      return;
    }
    setAvatarError('');
    setAvatarFile(file);

    try {
      // Create a URL for preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setShowAvatarModal(true);
    } catch (error) {
      console.error('Error processing image:', error);
      setAvatarError('Error processing image. Please try again.');
    }
  };
  const handleAvatarUpload = async () => {
    setShowAvatarModal(false);
    try {
      // Convert file to base64 if it exists
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        avatarUrl = await fileToBase64(avatarFile);
      }

      // Update user profile with new avatar
      await updateProfile({
        ...formData,
        avatar: avatarUrl,
      });

      toast.success('Avatar updated');
      setAvatarFile(null);
    } catch (error) {
      toast.error('Failed to update avatar');
      console.error('Avatar update error:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: t('profile.overview') || 'Overview', icon: UserCircleIcon },
    { id: 'security', name: t('profile.security') || 'Security', icon: ShieldCheckIcon },
    { id: 'activity', name: t('profile.activity') || 'Activity', icon: ClockIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
        </div>
        <div>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('common.cancel')}
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon
                  className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                  aria-hidden="true"
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <form
              onSubmit={async e => {
                e.preventDefault();
                setIsSaving(true);
                try {
                  // Process avatar if needed
                  let avatarData = avatarPreview;
                  if (avatarFile) {
                    avatarData = await fileToBase64(avatarFile);
                  }

                  // Include the current avatar in the update
                  await updateProfile({
                    ...formData,
                    avatar: avatarData,
                  });
                  setUnsaved(false);
                  toast.success('Profile saved');
                } catch (error) {
                  toast.error('Failed to save profile');
                  console.error('Profile update error:', error);
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column - Avatar */}
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 bg-gray-100 rounded-full overflow-hidden group">
                      <img
                        src={avatarPreview}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition group-hover:cursor-pointer"
                        aria-label="Change avatar"
                      >
                        <CameraIcon className="h-10 w-10 text-purple-400 opacity-0 group-hover:opacity-100" />
                      </button>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleAvatarSelect}
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <h2 className="text-xl font-semibold text-gray-900">{formData.name}</h2>
                      <span
                        className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}
                      >
                        {roleBadge.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-4 text-sm text-indigo-600 hover:text-indigo-900"
                      onClick={handleAvatarClick}
                    >
                      {t('profile.changePhoto')}
                    </button>
                    {avatarError && <div className="text-xs text-red-500 mt-2">{avatarError}</div>}
                  </div>
                  {/* Avatar confirmation modal */}
                  <Dialog
                    open={showAvatarModal}
                    onClose={() => setShowAvatarModal(false)}
                    className="fixed z-50 inset-0 overflow-y-auto"
                  >
                    <div className="flex items-center justify-center min-h-screen px-4">
                      <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                      <div className="bg-white rounded-lg p-6 z-50 max-w-sm mx-auto relative">
                        <Dialog.Title className="text-lg font-bold mb-2">
                          Confirm Photo Change
                        </Dialog.Title>
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowAvatarModal(false)}
                            className="px-4 py-2 rounded bg-gray-200 text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAvatarUpload}
                            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  </Dialog>
                </div>
                {/* Right column - Form fields */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      {t('profile.fullName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      maxLength={50}
                      title="Full name is required."
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      maxLength={100}
                      title="Email address is required."
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      {t('profile.bio')}
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Write a short bio (max 200 characters)"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-400 text-right">{bioCount}/200</div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-w-[90px]"
                      disabled={isSaving}
                    >
                      {isSaving && (
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                      )}
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="max-w-lg mx-auto space-y-8">
              <h2 className="text-xl font-semibold text-center">Security Settings</h2>
              <form className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-sm">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
                <div>
                  <span className="block text-sm font-medium text-gray-700">
                    Two-Factor Authentication (2FA)
                  </span>
                  <span className="block text-xs text-gray-500">
                    Add an extra layer of security to your account.
                  </span>
                </div>
                <button
                  type="button"
                  className="ml-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-center">Recent Activity</h2>
              <ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow-sm">
                {[
                  { action: 'Updated user permissions', time: '3:00 PM' },
                  { action: 'Changed password', time: '2:45 PM' },
                  { action: 'Enabled 2FA', time: '2:30 PM' },
                ].map((log, idx) => (
                  <li key={idx} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{log.action}</span>
                    <span className="text-xs text-gray-400">{log.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
