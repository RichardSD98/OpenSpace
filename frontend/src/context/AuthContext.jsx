import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: enrich auth user with profile (role, name, phone)
  const enrichUser = async (authUser) => {
    if (!authUser) { setUser(null); return; }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    setUser({
      _id: authUser.id,
      id: authUser.id,
      email: authUser.email,
      name: profile?.name || authUser.user_metadata?.name || '',
      phone: profile?.phone || authUser.user_metadata?.phone || '',
      role: profile?.role || authUser.user_metadata?.role || 'renter',
      isVerified: !!authUser.email_confirmed_at,
    });
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      enrichUser(session?.user ?? null).finally(() => setLoading(false));
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      enrichUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await enrichUser(data.user);
    return data;
  };

  const register = async ({ name, email, password, phone, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, role },
      },
    });
    if (error) throw error;
    await enrichUser(data.user);
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

