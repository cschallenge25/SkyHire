// components/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiLayout,
  FiFileText,
  FiMic,
  FiSend,
  FiUsers,
  FiBookOpen,
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi';
import sidebarImage from '../assets/sidebar-image.jpg';
import skyhireLogo from '../assets/skyhire-logo.png'; // Assure-toi d'avoir ce fichier
import { authService } from '../services/authService';

const menuItems = [
  { name: 'Dashboard', path: '/', Icon: FiLayout },
  { name: 'CV & Profile', path: '/cv', Icon: FiFileText },
  { name: 'Interview coach', path: '/interview', Icon: FiMic },
  { name: 'Flight opportunities', path: '/jobs', Icon: FiSend },
  { name: 'Crew network', path: '/network', Icon: FiUsers },
  { name: 'Career Guide', path: '/career', Icon: FiBookOpen },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  return (
    <aside className="relative flex w-72 min-h-screen flex-col overflow-hidden rounded-[28px] text-white shadow-[0_20px_50px_rgba(12,14,32,0.3)]">
      {/* Background avec image blur */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-md"
          style={{ backgroundImage: `url(${sidebarImage})` }}
        />
        <div className="absolute inset-0 rounded-[28px] border border-white/15" />
      </div>
      
      {/* Contenu compact */}
      <div className="relative flex h-full flex-col px-6 py-8">
        {/* Header avec LOGO SKYHIRE */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            {/* Logo SkyHire */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <img 
                src={skyhireLogo} 
                alt="SkyHire Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              {/* Texte supprimé - Seulement le nom */}
              <h1 className="text-2xl font-bold font-emirates leading-tight">SkyHire</h1>
            </div>
          </div>
          <p className="font-montessart text-xs italic text-white/70">"Your Career Takes Off Here."</p>
        </div>

        {/* Navigation compacte */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.Icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`group relative flex items-center justify-between rounded-3xl border px-5 py-4 transition-all duration-300 ${
                  isActive
                    ? 'border-white/60 bg-white/20 shadow-[0_18px_40px_rgba(6,10,38,0.45)]'
                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icône */}
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-white to-white/70 text-[#312456]'
                        : 'bg-white/10 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <Icon className="text-2xl" />
                  </span>
                  
                  {/* Texte */}
                  <span
                    className={`font-montessart text-lg tracking-wide transition-colors ${
                      isActive ? 'font-semibold text-white' : 'text-white/80 group-hover:text-white'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                
                {/* Chevron */}
                <FiChevronRight
                  className={`text-xl transition-colors ${
                    isActive ? 'text-white' : 'text-white/40 group-hover:text-white'
                  }`}
                />
              </NavLink>
            );
          })}

          {currentUser?.role === 'candidate' && (
            <NavLink
              to="/applications"
              className={`group relative flex items-center justify-between rounded-3xl border px-5 py-4 transition-all duration-300 ${
                location.pathname === '/applications'
                  ? 'border-white/60 bg-white/20 shadow-[0_18px_40px_rgba(6,10,38,0.45)]'
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                  location.pathname === '/applications' ? 'bg-gradient-to-br from-white to-white/70 text-[#312456]' : 'bg-white/10 text-white group-hover:bg-white/20'
                }`}>
                  <FiFileText className="text-2xl" />
                </span>
                <span className={`font-montessart text-lg tracking-wide transition-colors ${
                  location.pathname === '/applications' ? 'font-semibold text-white' : 'text-white/80 group-hover:text-white'
                }`}>
                  My Applications
                </span>
              </div>
              <FiChevronRight className={`text-xl transition-colors ${
                location.pathname === '/applications' ? 'text-white' : 'text-white/40 group-hover:text-white'
              }`} />
            </NavLink>
          )}

          {(currentUser?.role === 'recruiter' || currentUser?.role === 'admin') && (
            <NavLink
              to="/jobs/my"
              className={`group relative flex items-center justify-between rounded-3xl border px-5 py-4 transition-all duration-300 ${
                location.pathname === '/jobs/my'
                  ? 'border-white/60 bg-white/20 shadow-[0_18px_40px_rgba(6,10,38,0.45)]'
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                  location.pathname === '/jobs/my' ? 'bg-gradient-to-br from-white to-white/70 text-[#312456]' : 'bg-white/10 text-white group-hover:bg-white/20'
                }`}>
                  <FiSend className="text-2xl" />
                </span>
                <span className={`font-montessart text-lg tracking-wide transition-colors ${
                  location.pathname === '/jobs/my' ? 'font-semibold text-white' : 'text-white/80 group-hover:text-white'
                }`}>
                  My Jobs
                </span>
              </div>
              <FiChevronRight className={`text-xl transition-colors ${
                location.pathname === '/jobs/my' ? 'text-white' : 'text-white/40 group-hover:text-white'
              }`} />
            </NavLink>
          )}
        </nav>

        {/* Sign Out réduit */}
        <div className="mt-auto pt-8">
          <button className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 font-montessart text-sm text-white/80 transition-all duration-200 hover:border-white/40 hover:bg-white/15 hover:text-white">
            <FiLogOut className="text-base" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;