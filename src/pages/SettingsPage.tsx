// pages/SettingsPage.tsx
import React, { useState } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiSave, FiTrash2 } from 'react-icons/fi';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile Settings
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    language: 'english',
    timezone: 'UTC+1'
  });

  // Security Settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simuler sauvegarde
    setTimeout(() => {
      showSuccess('Profile settings saved successfully!');
      setIsLoading(false);
    }, 1000);
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showError('New passwords do not match!');
      return;
    }
    try {
      setIsLoading(true);
      await authService.changePassword(security.currentPassword, security.newPassword);
      showSuccess('Password changed successfully!');
      setSecurity(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      setIsLoading(true);
      await authService.deleteAccount();
      authService.logout();
      showSuccess('Your account has been deleted.');
      navigate('/login');
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-emirates font-bold text-black mb-3">
          Account Settings
        </h1>
        <p className="text-gray-600 font-montessart text-lg">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile Settings', icon: FiUser },
                { id: 'security', label: 'Security', icon: FiLock }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montessart transition-all ${
                      activeTab === item.id
                        ? 'bg-[#423772] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#423772] rounded-xl flex items-center justify-center">
                  <FiUser className="text-2xl text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 font-emirates">
                  Profile Settings
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                      Language
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                    >
                      <option value="english">English</option>
                      <option value="french">French</option>
                      <option value="arabic">Arabic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                      Timezone
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                    >
                      <option value="UTC+1">UTC+1 (Central European Time)</option>
                      <option value="UTC+0">UTC+0 (GMT)</option>
                      <option value="UTC+4">UTC+4 (Gulf Standard Time)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[#423772] text-white px-6 py-3 rounded-xl font-montessart font-semibold hover:bg-[#312456] transition-colors disabled:opacity-60"
                  >
                    <FiSave className="text-lg" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <FiLock className="text-2xl text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 font-emirates">
                  Security Settings
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={security.showCurrentPassword ? 'text' : 'password'}
                      value={security.currentPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setSecurity(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {security.showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={security.showNewPassword ? 'text' : 'password'}
                        value={security.newPassword}
                        onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setSecurity(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {security.showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={security.showConfirmPassword ? 'text' : 'password'}
                        value={security.confirmPassword}
                        onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setSecurity(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {security.showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading || !security.currentPassword || !security.newPassword || !security.confirmPassword}
                    className="flex items-center gap-2 bg-[#423772] text-white px-6 py-3 rounded-xl font-montessart font-semibold hover:bg-[#312456] transition-colors disabled:opacity-60"
                  >
                    <FiSave className="text-lg" />
                    {isLoading ? 'Updating...' : 'Change Password'}
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-red-600 font-montessart mb-4">
                    Danger Zone
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 font-montessart mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-red-700 transition-colors"
                    >
                      <FiTrash2 className="text-lg" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;