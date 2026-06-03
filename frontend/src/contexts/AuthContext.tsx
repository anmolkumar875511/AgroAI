import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI, getToken, setToken, clearToken, type UserOut } from '@/api/client';
import { useTheme } from '@/contexts/ThemeContext';

interface AuthContextType {
  user: UserOut | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: UserOut) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  // On mount: if a token exists, validate it and restore session
  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (!token) { setIsLoading(false); return; }
      try {
        const profile = await authAPI.me();
        setUser(profile);
        if (profile.theme === 'light' || profile.theme === 'dark') {
          setTheme(profile.theme);
        }
      } catch {
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, [setTheme]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    setToken(res.access_token);
    localStorage.setItem('agroai_user', JSON.stringify(res.user));
    setUser(res.user);
    if (res.user.theme === 'light' || res.user.theme === 'dark') {
      setTheme(res.user.theme);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUser = (updatedUser: UserOut) => {
    setUser(updatedUser);
    localStorage.setItem('agroai_user', JSON.stringify(updatedUser));
    if (updatedUser.theme === 'light' || updatedUser.theme === 'dark') {
      setTheme(updatedUser.theme);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
