import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  UserCircleIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  PencilIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('/api/placeholder/150/150');

  const [profileData, setProfileData] = useState({
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    department: 'Computer Science',
    position: 'System Administrator',
    preferred_language: 'en',
    bio: 'Experienced system administrator with expertise in educational technology.',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    examAlerts: true,
    systemAlerts: false,
  });

  const tabs = [
    { id: 'overview', name: t('profile.overview', 'Overview'), icon: UserCircleIcon },
    { id: 'security', name: t('profile.security', 'Security'), icon: ShieldCheckIcon },
    { id: 'notifications', name: t('profile.notifications', 'Notifications'), icon: BellIcon },
    { id: 'preferences', name: t('profile.preferences', 'Preferences'), icon: CogIcon },
    { id: 'activity', name: t('profile.activity', 'Activity'), icon: ClockIcon },
  ];

  const handleProfileChange = e => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = e => {
    setSecurityData({ ...securityData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async e => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('profile.profileUpdated', 'Profile updated successfully!'));
    } catch (error) {
      toast.error(t('profile.updateError', 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error(t('profile.passwordMismatch', 'Passwords do not match'));
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('profile.passwordChanged', 'Password changed successfully!'));
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(t('profile.passwordError', 'Failed to change password'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = setting => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
    toast.success(t('profile.settingsUpdated', 'Settings updated'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('profile.title', 'Admin Profile')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('profile.subtitle', 'Manage your account settings and preferences')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircleIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {profileData.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profileData.position}</p>
                </div>
              </div>

              <nav className="border-t border-gray-200 dark:border-gray-700">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('profile.personalInformation', 'Personal Information')}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          'profile.personalInfoDesc',
                          'Update your personal details and profile information'
                        )}
                      </p>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      {/* Avatar Upload */}
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <img
                            src={avatarPreview}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <CameraIcon className="w-6 h-6 text-white" />
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t('profile.profilePhoto', 'Profile Photo')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('profile.photoDesc', 'Upload a professional photo. Max size: 5MB')}
                          </p>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.fullName', 'Full Name')} *
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            value={profileData.full_name}
                            onChange={handleProfileChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.email', 'Email Address')} *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.phone', 'Phone Number')}
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('profile.department', 'Department')}
                          </label>
                          <input
                            type="text"
                            name="department"
                            value={profileData.department}
                            onChange={handleProfileChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('profile.bio', 'Bio')}
                        </label>
                        <textarea
                          name="bio"
                          rows={4}
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {isSaving
                            ? t('common.saving', 'Saving...')
                            : t('common.saveChanges', 'Save Changes')}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('profile.securitySettings', 'Security Settings')}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('profile.securityDesc', 'Manage your password and security preferences')}
                      </p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('profile.currentPassword', 'Current Password')} *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={securityData.currentPassword}
                            onChange={handleSecurityChange}
                            required
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('profile.newPassword', 'New Password')} *
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={securityData.newPassword}
                          onChange={handleSecurityChange}
                          required
                          minLength={8}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('profile.confirmPassword', 'Confirm New Password')} *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={securityData.confirmPassword}
                          onChange={handleSecurityChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {isSaving
                            ? t('common.updating', 'Updating...')
                            : t('profile.changePassword', 'Change Password')}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('profile.notificationSettings', 'Notification Settings')}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          'profile.notificationDesc',
                          'Configure how you receive notifications and alerts'
                        )}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t('profile.emailNotifications', 'Email Notifications')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('profile.emailNotificationsDesc', 'Receive notifications via email')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('emailNotifications')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.emailNotifications
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.emailNotifications
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Push Notifications */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t('profile.pushNotifications', 'Push Notifications')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t(
                              'profile.pushNotificationsDesc',
                              'Receive browser push notifications'
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('pushNotifications')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.pushNotifications
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.pushNotifications
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Exam Alerts */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t('profile.examAlerts', 'Exam Alerts')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t(
                              'profile.examAlertsDesc',
                              'Get notified about exam events and violations'
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('examAlerts')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.examAlerts
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.examAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* System Alerts */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t('profile.systemAlerts', 'System Alerts')}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t(
                              'profile.systemAlertsDesc',
                              'Receive system maintenance and security alerts'
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange('systemAlerts')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings.systemAlerts
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('profile.systemPreferences', 'System Preferences')}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          'profile.preferencesDesc',
                          'Customize your system experience and interface'
                        )}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Language Preference */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          {t('profile.language', 'Language')}
                        </h3>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100">
                          <option value="en">English</option>
                          <option value="bn">বাংলা (Bangla)</option>
                        </select>
                      </div>

                      {/* Theme Preference */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          {t('profile.themePreference', 'Theme Preference')}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <button className="p-3 border-2 border-blue-500 rounded-lg bg-white text-gray-900">
                            <span className="text-xs font-medium">Light</span>
                          </button>
                          <button className="p-3 border-2 border-gray-300 rounded-lg bg-gray-800 text-white">
                            <span className="text-xs font-medium">Dark</span>
                          </button>
                        </div>
                      </div>

                      {/* Time Zone */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          {t('profile.timeZone', 'Time Zone')}
                        </h3>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100">
                          <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                          <option value="UTC">UTC (GMT+0)</option>
                          <option value="America/New_York">America/New_York (GMT-5)</option>
                          <option value="Europe/London">Europe/London (GMT+0)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t('profile.recentActivity', 'Recent Activity')}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(
                          'profile.activityDesc',
                          'View your recent login history and system activity'
                        )}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          action: 'Login',
                          time: '2 minutes ago',
                          ip: '192.168.1.100',
                          status: 'success',
                        },
                        {
                          action: 'Profile Updated',
                          time: '1 hour ago',
                          ip: '192.168.1.100',
                          status: 'success',
                        },
                        {
                          action: 'Password Changed',
                          time: '2 days ago',
                          ip: '192.168.1.100',
                          status: 'success',
                        },
                        {
                          action: 'Failed Login Attempt',
                          time: '3 days ago',
                          ip: '192.168.1.105',
                          status: 'warning',
                        },
                        {
                          action: 'Exam Created',
                          time: '1 week ago',
                          ip: '192.168.1.100',
                          status: 'success',
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                activity.status === 'success'
                                  ? 'bg-green-500'
                                  : activity.status === 'warning'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {activity.action}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                IP: {activity.ip}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.time}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <button className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                        {t('profile.viewMoreActivity', 'View More Activity')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
