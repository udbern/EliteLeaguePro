import { useState, useEffect, createContext, useContext } from 'react';

type User = { id: string; email?: string | null } | null;
type Session = { user: User } | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  userRole: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Legacy Supabase auth removed; treat user as always signed-out for now.
    setSession(null);
    setUser(null);
    setUserRole(null);
    setLoading(false);
  }, []);

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setUserRole(null);
    window.location.href = '/auth';
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};