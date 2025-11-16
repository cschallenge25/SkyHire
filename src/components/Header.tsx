// components/Header.tsx - Version finale avec Account Settings
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiBell, FiSettings, FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { notificationService } from '../services/notificationService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Unread counters
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { conversations } = await chatService.getConversations({ limit: 50 });
        const total = (conversations || []).reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        if (mounted) setUnreadMessages(total);
      } catch {
        if (mounted) setUnreadMessages(0);
      }
    };
    const loadNotif = async () => {
      try {
        const stats = await notificationService.getStats();
        if (mounted) setUnreadNotifications(stats.unread || 0);
      } catch {
        if (mounted) setUnreadNotifications(0);
      }
    };
    load();
    loadNotif();
    const id = setInterval(load, 15000); // refresh chat periodically
    const id2 = setInterval(loadNotif, 30000); // refresh notifications periodically
    return () => { mounted = false; clearInterval(id); clearInterval(id2); };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Message de bienvenue SIMPLIFIÉ */}
          <div className="text-gray-600 font-montessart">
            {currentUser ? (
              <span className="text-lg font-semibold text-[#423772]">
                Welcome, {currentUser.name}!
              </span>
            ) : (
              'Welcome to SkyHire - Your aviation career platform'
            )}
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              // Utilisateur connecté - Menu profil
              <div className="flex items-center space-x-4">
                {/* Messages */}
                <Link
                  to="/chat"
                  className="relative p-2 text-gray-600 hover:text-[#423772] transition-colors group"
                >
                  <FiMessageCircle className="text-xl group-hover:scale-110 transition-transform" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-600 hover:text-[#423772] transition-colors group"
                >
                  <FiBell className="text-xl group-hover:scale-110 transition-transform" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200">
                    {/* Avatar avec initiale */}
                    <div className="w-10 h-10 bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-full flex items-center justify-center text-white font-bold text-lg font-emirates shadow-md">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Info utilisateur */}
                    <div className="text-left hidden lg:block">
                      <p className="font-montessart font-semibold text-gray-800 text-sm">
                        {currentUser.name}
                      </p>
                      <p className="font-montessart text-gray-500 text-xs">
                        {currentUser.role === 'candidate' ? 'Aviation Candidate' : 'Recruiter'}
                      </p>
                    </div>
                    
                    {/* Chevron */}
                    <FiChevronDown className="text-gray-400 group-hover:text-[#423772] transition-colors" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {/* En-tête profil */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-montessart font-semibold text-gray-800">
                        {currentUser.name}
                      </p>
                      <p className="font-montessart text-gray-500 text-sm">
                        {currentUser.email}
                      </p>
                    </div>

                    {/* Actions */}
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-montessart transition-colors"
                    >
                      <FiUser className="text-lg text-[#423772]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/chat"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-montessart transition-colors"
                    >
                      <FiMessageCircle className="text-lg text-[#423772]" />
                      <span>Messages</span>
                      {unreadMessages > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          {unreadMessages}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/notifications"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-montessart transition-colors"
                    >
                      <FiBell className="text-lg text-[#423772]" />
                      <span>Notifications</span>
                      {unreadNotifications > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          {unreadNotifications}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 font-montessart transition-colors"
                    >
                      <FiSettings className="text-lg text-[#423772]" />
                      <span>Account Settings</span>
                    </Link>

                    {/* Séparateur */}
                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Déconnexion */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 font-montessart transition-colors"
                    >
                      <FiLogOut className="text-lg" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Utilisateur non connecté - Boutons Login/SignUp
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-[#423772] font-montessart transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#423772] text-white px-6 py-2 rounded-lg hover:bg-[#312456] transition-colors font-montessart font-semibold shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;