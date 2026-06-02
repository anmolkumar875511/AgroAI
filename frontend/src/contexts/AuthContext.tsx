import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI, getToken, setToken, clearToken, type UserOut } from '@/api/client';

interface AuthContextType {
  user: UserOut | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: if a token exists, validate it and restore session
  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (!token) { setIsLoading(false); return; }
      try {
        const profile = await authAPI.me();
        setUser(profile);
      } catch {
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    setToken(res.access_token);
    localStorage.setItem('agroai_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
