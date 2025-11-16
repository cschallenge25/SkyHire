// pages/NotificationsPage.tsx
import React, { useEffect, useState } from 'react';
import { FiBell, FiCheck, FiTrash2, FiSettings, FiUser, FiMessageCircle, FiAward } from 'react-icons/fi';
import { notificationService, NotificationItem } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';

interface Notification extends Omit<NotificationItem, '_id' | 'createdAt'> {
  id: string;
  timestamp: string;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [notifSettings, setNotifSettings] = useState<{
    email: boolean;
    push: boolean;
    message: boolean;
    connection: boolean;
    job: boolean;
  }>({
    email: true,
    push: true,
    message: true,
    connection: true,
    job: true,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { notifications: list } = await notificationService.getList({ page: 1, limit: 50 });
      const mapped: Notification[] = (list || []).map((n) => ({
        id: n._id,
        type: (n.type as any) || 'system',
        title: n.title,
        message: n.message,
        timestamp: n.createdAt,
        read: n.read,
        data: n.data,
        userId: n.userId,
      }));
      setNotifications(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        const profile = await userService.getProfile();
        const ns = (profile?.preferences && (profile.preferences as any).notifications) || {};
        setNotifSettings({
          email: ns.email !== false,
          push: ns.push !== false,
          message: ns.message !== false,
          connection: ns.connection !== false,
          job: ns.job !== false,
        });
      } catch {
        // noop
      }
    })();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // noop
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // noop
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // noop
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'connection':
        return <FiUser className="text-blue-500" />;
      case 'message':
        return <FiMessageCircle className="text-green-500" />;
      case 'job':
        return <FiAward className="text-purple-500" />;
      case 'system':
        return <FiBell className="text-orange-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string | Date) => {
    const ts = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - ts.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Derived stats
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayCount = notifications.filter((n) => {
    const ts = new Date(n.timestamp);
    return ts >= startOfToday;
  }).length;
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekCount = notifications.filter((n) => {
    const ts = new Date(n.timestamp);
    return ts >= weekAgo;
  }).length;

  const goTo = (n: Notification) => {
    let to = '/notifications';
    if (n.type === 'message') to = '/chat';
    else if (n.type === 'connection') to = '/network';
    else if (n.type === 'job') {
      const jobId = (n as any)?.data?.jobId;
      to = jobId ? `/jobs?jobId=${jobId}` : '/jobs';
    }
    navigate(to);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const profile = await userService.getProfile();
      const prefs = { ...(profile?.preferences || {}), notifications: { ...notifSettings } };
      await userService.updateProfile({ preferences: prefs });
      setSettingsOpen(false);
      showSuccess('Notification settings saved');
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-emirates font-bold text-black mb-3">
          Notifications
        </h1>
        <p className="text-gray-600 font-montessart text-lg">
          Stay updated with your aviation career activities
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#423772] rounded-xl flex items-center justify-center">
                <FiBell className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 font-emirates">
                  Your Notifications
                </h2>
                <p className="text-gray-600 font-montessart">
                  {unreadCount} unread of {notifications.length} total
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 bg-[#423772] text-white px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-[#312456] transition-colors"
                >
                  <FiCheck className="text-lg" />
                  Mark All Read
                </button>
              )}
              <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-gray-200 transition-colors">
                <FiSettings className="text-lg" />
                Settings
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-6 text-gray-600 font-montessart">Loading...</div>
            ) : error ? (
              <div className="p-6 text-red-600 font-montessart">{error}</div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 transition-all ${
                      notification.read ? 'bg-white' : 'bg-blue-50 border-l-4 border-l-blue-500'
                    } hover:bg-gray-50`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className={`font-semibold font-montessart ${
                              notification.read ? 'text-gray-800' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-montessart font-semibold">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-montessart mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 font-montessart text-sm">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                            <button onClick={() => goTo(notification)} className="text-[#423772] font-montessart text-sm font-semibold hover:text-[#312456] transition-colors">
                              View
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
                            title="Mark as read"
                          >
                            <FiCheck className="text-sm" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete notification"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <FiBell className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-montessart text-lg mb-2">
                  No notifications yet
                </p>
                <p className="text-gray-400 font-montessart text-sm">
                  Your notifications will appear here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* Notification Stats */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 font-montessart mb-4">
              Notification Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-montessart">Unread</span>
                <span className="text-2xl font-bold text-blue-600 font-emirates">{unreadCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-montessart">Today</span>
                <span className="text-xl font-bold text-gray-800 font-emirates">{todayCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-montessart">This Week</span>
                <span className="text-xl font-bold text-gray-800 font-emirates">{weekCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-2xl p-6 text-white">
            <h3 className="font-semibold font-montessart mb-3">Notification Settings</h3>
            <p className="text-white/80 font-montessart text-sm mb-4">
              Control how you receive notifications
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input type="checkbox" defaultChecked className="rounded text-[#423772]" />
                Email Notifications
              </label>
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input type="checkbox" defaultChecked className="rounded text-[#423772]" />
                Push Notifications
              </label>
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input type="checkbox" defaultChecked className="rounded text-[#423772]" />
                Connection Requests
              </label>
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input type="checkbox" defaultChecked className="rounded text-[#423772]" />
                Job Matches
              </label>
            </div>
          </div>
        </div>
      </div>
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSettingsOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 font-emirates mb-4">Notification Settings</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input
                  type="checkbox"
                  checked={notifSettings.email}
                  onChange={(e) => setNotifSettings((s) => ({ ...s, email: e.target.checked }))}
                  className="rounded text-[#423772]"
                />
                Email Notifications
              </label>
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input
                  type="checkbox"
                  checked={notifSettings.push}
                  onChange={(e) => setNotifSettings((s) => ({ ...s, push: e.target.checked }))}
                  className="rounded text-[#423772]"
                />
                Push Notifications
              </label>
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input
                  type="checkbox"
                  checked={notifSettings.message}
                  onChange={(e) => setNotifSettings((s) => ({ ...s, message: e.target.checked }))}
                  className="rounded text-[#423772]"
                />
                New Messages
              </label>
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input
                  type="checkbox"
                  checked={notifSettings.connection}
                  onChange={(e) => setNotifSettings((s) => ({ ...s, connection: e.target.checked }))}
                  className="rounded text-[#423772]"
                />
                Connection Requests
              </label>
              <label className="flex items-center gap-3 text-sm font-montessart">
                <input
                  type="checkbox"
                  checked={notifSettings.job}
                  onChange={(e) => setNotifSettings((s) => ({ ...s, job: e.target.checked }))}
                  className="rounded text-[#423772]"
                />
                Job Updates
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSettingsOpen(false)} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-[#423772] text-white px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-[#312456] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;