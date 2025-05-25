import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CogIcon,
  BellIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import BackButton from '../../components/common/BackButton';
import PageHeader from '../../components/layout/PageHeader';

/**
 * Enhanced Admin Profile Management Component
 * Comprehensive profile management with admin-specific features
 */
const AdminProfile = () => {
  const { t } = useTranslation(['profile', 'common', 'admin']);
  const { user, updateProfile, changePassword, getUserName, getUserEmail } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || '/assets/images/default-avatar.svg'
  );

  // Form data state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || getUserName(),
    email: user?.email || getUserEmail(),
    bio: user?.bio || 'System administrator with full access to all features.',
    phone: user?.phone || '',
    department: user?.department || 'IT Administration',
    position: user?.position || 'System Administrator',
    preferred_language: user?.preferred_language || 'en',
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: user?.email_notifications ?? true,
    pushNotifications: user?.push_notifications ?? true,
    examAlerts: user?.exam_alerts ?? true,
    systemAlerts: user?.system_alerts ?? true,
    weeklyReports: user?.weekly_reports ?? true,
  });

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      name: t('profile.overview', 'Overview'),
      icon: UserCircleIcon,
      description: 'Personal information and profile details',
    },
    {
      id: 'security',
      name: t('profile.security', 'Security'),
      icon: ShieldCheckIcon,
      description: 'Password and security settings',
    },
    {
      id: 'notifications',
      name: t('profile.notifications', 'Notifications'),
      icon: BellIcon,
      description: 'Notification preferences and alerts',
    },
    {
      id: 'preferences',
      name: t('profile.preferences', 'Preferences'),
      icon: CogIcon,
      description: 'System preferences and settings',
    },
    {
      id: 'activity',
      name: t('profile.activity', 'Activity'),
      icon: ClockIcon,
      description: 'Recent activity and login history',
    },
  ];

  /**
   * Handle profile data changes
   */
  const handleProfileChange = e => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle security data changes
   */
  const handleSecurityChange = e => {
    const { name, value } = e.target;
    setSecurityData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle notification settings changes
   */
  const handleNotificationChange = setting => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  /**
   * Handle avatar file selection
   */
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error('Avatar file size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = e => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  /**
   * Convert file to base64
   */
  const fileToBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Handle profile update
   */
  const handleProfileUpdate = async e => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let updateData = { ...profileData };

      // Handle avatar upload
      if (avatarFile) {
        const avatarBase64 = await fileToBase64(avatarFile);
        updateData.avatar = avatarBase64;
      }

      const result = await updateProfile(updateData);

      if (result.success) {
        toast.success(result.message || t('profile.updateSuccess', 'Profile updated successfully'));
        setAvatarFile(null);
      } else {
        toast.error(result.message || t('profile.updateError', 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t('profile.updateError', 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async e => {
    e.preventDefault();

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch', 'Passwords do not match'));
      return;
    }

    if (securityData.newPassword.length < 8) {
      toast.error(t('auth.passwordTooShort', 'Password must be at least 8 characters'));
      return;
    }

    setIsSaving(true);

    try {
      const result = await changePassword({
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      });

      if (result.success) {
        toast.success(
          result.message || t('profile.passwordChangeSuccess', 'Password changed successfully')
        );
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(
          result.message || t('profile.passwordChangeError', 'Failed to change password')
        );
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(t('profile.passwordChangeError', 'Failed to change password'));
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle notification settings update
   */
  const handleNotificationUpdate = async () => {
    setIsSaving(true);

    try {
      const result = await updateProfile(notificationSettings);

      if (result.success) {
        toast.success(t('profile.notificationUpdateSuccess', 'Notification settings updated'));
      } else {
        toast.error(t('profile.notificationUpdateError', 'Failed to update notification settings'));
      }
    } catch (error) {
      console.error('Notification update error:', error);
      toast.error(t('profile.notificationUpdateError', 'Failed to update notification settings'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton />
          <PageHeader
            title={t('admin.profileManagement', 'Admin Profile Management')}
            subtitle={t(
              'admin.profileSubtitle',
              'Manage your administrator profile and system preferences'
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {/* Profile Summary */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircleIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {getUserName()}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin'
                      ? t('admin.systemAdministrator', 'System Administrator')
                      : user?.role}
                  </p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{tab.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {tab.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6">
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
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <PhotoIcon className="w-6 h-6 text-white" />
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
                        <button
                          type="button"
                          onClick={() => document.getElementById('avatar-upload').click()}
                          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          {t('profile.changePhoto', 'Change Photo')}
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="full_name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('profile.fullName', 'Full Name')} *
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={profileData.full_name}
                          onChange={handleProfileChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('profile.email', 'Email Address')} *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter your email address"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('profile.phone', 'Phone Number')}
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="department"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('profile.department', 'Department')}
                        </label>
                        <input
                          type="text"
                          id="department"
                          name="department"
                          value={profileData.department}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter your department"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="position"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('profile.position', 'Position')}
                        </label>
                        <input
                          type="text"
                          id="position"
                          name="position"
                          value={profileData.position}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter your position"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="preferred_language"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t('profile.preferredLanguage', 'Preferred Language')}
                        </label>
                        <select
                          id="preferred_language"
                          name="preferred_language"
                          value={profileData.preferred_language}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="en">English</option>
                          <option value="bn">বাংলা (Bangla)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('profile.bio', 'Bio')}
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* Submit Button */}
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
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
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
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('profile.currentPassword', 'Current Password')} *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="currentPassword"
                          name="currentPassword"
                          value={securityData.currentPassword}
                          onChange={handleSecurityChange}
                          required
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                          placeholder="Enter your current password"
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
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('profile.newPassword', 'New Password')} *
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={securityData.newPassword}
                        onChange={handleSecurityChange}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Enter your new password"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t(
                          'profile.passwordRequirements',
                          'Password must be at least 8 characters long'
                        )}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {t('profile.confirmPassword', 'Confirm New Password')} *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={securityData.confirmPassword}
                        onChange={handleSecurityChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Confirm your new password"
                      />
                    </div>

                    {/* Submit Button */}
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
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
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
                          {t('profile.pushNotificationsDesc', 'Receive browser push notifications')}
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

                    {/* Weekly Reports */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t('profile.weeklyReports', 'Weekly Reports')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('profile.weeklyReportsDesc', 'Receive weekly system usage reports')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNotificationChange('weeklyReports')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.weeklyReports
                            ? 'bg-blue-600'
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={handleNotificationUpdate}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isSaving
                          ? t('common.saving', 'Saving...')
                          : t('common.saveChanges', 'Save Changes')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6">
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
                    {/* Theme Preference */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        {t('profile.themePreference', 'Theme Preference')}
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <button className="p-3 border-2 border-blue-500 rounded-lg bg-white text-gray-900">
                          <div className="w-full h-8 bg-white border rounded mb-2"></div>
                          <span className="text-xs font-medium">Light</span>
                        </button>
                        <button className="p-3 border-2 border-gray-300 rounded-lg bg-gray-800 text-white">
                          <div className="w-full h-8 bg-gray-800 border border-gray-600 rounded mb-2"></div>
                          <span className="text-xs font-medium">Dark</span>
                        </button>
                        <button className="p-3 border-2 border-gray-300 rounded-lg bg-gradient-to-br from-white to-gray-800 text-gray-900">
                          <div className="w-full h-8 bg-gradient-to-r from-white to-gray-800 border rounded mb-2"></div>
                          <span className="text-xs font-medium">Auto</span>
                        </button>
                      </div>
                    </div>

                    {/* Dashboard Layout */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        {t('profile.dashboardLayout', 'Dashboard Layout')}
                      </h3>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100">
                        <option value="default">Default Layout</option>
                        <option value="compact">Compact Layout</option>
                        <option value="detailed">Detailed Layout</option>
                      </select>
                    </div>

                    {/* Data Export Format */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                        {t('profile.exportFormat', 'Default Export Format')}
                      </h3>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100">
                        <option value="csv">CSV</option>
                        <option value="excel">Excel</option>
                        <option value="pdf">PDF</option>
                        <option value="json">JSON</option>
                      </select>
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
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="p-6">
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
                    {/* Activity Items */}
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
                          ></div>
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

                  {/* View More Button */}
                  <div className="mt-6 text-center">
                    <button className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                      {t('profile.viewMoreActivity', 'View More Activity')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
