import React, { createContext, useState, useEffect, useContext } from 'react';

const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // ==========================================
  // THE GLOBAL STATE TREE
  // Structured into logical enterprise domains
  // ==========================================
  const state = {
    auth: {
      user: user,
      isLoggedIn: !!user, // Automatically true if user object exists, false if null
      login: (userData) => setUser(userData),
      logout: () => setUser(null)
    },
    ui: {
      theme: theme,
      toggleTheme: () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      }
    }
    // Future domains can be added here easily:
    // system: { ... },
    // analytics: { ... }
  };

  // Side-effect: Apply theme to DOM
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  // Side-effect: Verify session on application startup
  useEffect(() => {
    fetch('http://localhost:8080/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setUser(data); })
      .catch(() => setUser(null));
  }, []);

  return (
    <AppStateContext.Provider value={state}>
      {children}
    </AppStateContext.Provider>
  );
}

// Custom hook to access the global state anywhere in the app
export const useAppState = () => useContext(AppStateContext);