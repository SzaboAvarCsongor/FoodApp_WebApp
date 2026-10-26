import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { fetchMe, registerAccount } from "../services/api";

const AuthContext = createContext(null);

// where each role lands after login
// eslint-disable-next-line react-refresh/only-export-components
export function homePathForRole(role) {
  if (role === "RESTAURANT_ADMIN") return "/restaurant-admin";
  if (role === "SUPER_ADMIN") return "/super-admin";
  return "/";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // true while the saved login is being restored
  const [loading, setLoading] = useState(true);

  // restore the login after a page refresh
  useEffect(() => {
    async function restore() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        try {
          setUser(await fetchMe());
        } catch {
          await supabase.auth.signOut();
        }
      }

      setLoading(false);
    }

    restore();
  }, []);

  // login with supabase auth, then load the profile with the role
  async function login({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { ok: false, error: "Hibás e-mail vagy jelszó." };

    try {
      const profile = await fetchMe();
      setUser(profile);
      return { ok: true, user: profile };
    } catch (err) {
      await supabase.auth.signOut();
      return { ok: false, error: err.message };
    }
  }

  // register on the backend (it decides the role), then log in
  async function register({ fullName, email, password, accountType, restaurantCode }) {
    try {
      await registerAccount({ fullName, email, password, accountType, restaurantCode });
    } catch (err) {
      return { ok: false, error: err.message };
    }

    return login({ email, password });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook so any component can read the logged in user
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}