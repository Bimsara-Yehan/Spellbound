import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: 'OWNER' | 'MANAGER' | 'STAFF') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'spellbound_admin_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, role: 'OWNER' | 'MANAGER' | 'STAFF' = 'OWNER') => {
    // Simulated authentication for admin panel shell
    const mockUser: User = {
      id: 'usr_1',
      name: (email.split('@')[0] ?? 'User').replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      role,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
