import React, { useState } from 'react';
import { User, LogOut, List, Moon, Sun, MessageSquare } from 'lucide-react';
import { useAppState } from '../context/AppState';

export default function Header({ onAddClick, onLoginClick, onSignupClick, onMyReportsClick, onInboxClick, unreadCount = 0 }) {
  const { auth, ui } = useAppState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('http://localhost:8080/api/auth/logout', { method: 'POST', credentials: 'include' });
    auth.logout();
    setIsMenuOpen(false);
  };

  const displayBadge = unreadCount > 4 ? '4+' : unreadCount;

  return (
    <header className="flex justify-between items-center py-6 mb-8 border-b border-slate-200 dark:border-slate-700 relative">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          <span className="text-blue-600">Lost & Found</span>
        </h1>
      </div>

      {!auth.isLoggedIn ? (
        <div className="flex items-center gap-3">
          <button onClick={onLoginClick} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
            Login
          </button>
          <button onClick={onSignupClick} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
            Sign Up
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Chat Inbox Button with Badge */}
          <button onClick={onInboxClick} className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition" title="Messages">
            <MessageSquare size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {displayBadge}
              </span>
            )}
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 dark:text-black">{auth.user.fullName}</p>
                <p className="text-xs text-slate-500 font-medium">Score: {auth.user.score || 0} ⭐</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center overflow-hidden">
                {auth.user.profilePhotoUrl ? (
                  <img src={auth.user.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-blue-600" size={20} />
                )}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 overflow-hidden">
                <button onClick={() => { onMyReportsClick(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  <List size={16} /> My Reports
                </button>
                
                <button onClick={ui.toggleTheme} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                  {ui.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} 
                  {ui.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                
                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-semibold">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}