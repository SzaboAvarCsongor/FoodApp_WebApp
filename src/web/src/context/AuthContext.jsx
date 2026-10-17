import { createContext, useContext, useState } from "react";
import { useData } from "./DataContext";

const AuthContext = createContext(null);

const USERS_KEY = "foodapp_users";
const SESSION_KEY = "foodapp_session";

// temporary: super admin exists from the start, it cannot register
const seedUsers = [
  {
    id: "u-super",
    fullName: "Szuper Admin",
    email: "super@foodapp.com",
    password: "123456",
    role: "SUPER_ADMIN",
  },
];

// read json from localstorage without crashing on bad data
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// where each role lands after login
// eslint-disable-next-line react-refresh/only-export-components
export function homePathForRole(role) {
  if (role === "RESTAURANT_ADMIN") return "/restaurant-admin";
  if (role === "SUPER_ADMIN") return "/super-admin";
  return "/";
}

export function AuthProvider({ children }) {
  const { findByCode, setOwner } = useData();

  // the logged in user, restored from the saved session
  const [user, setUser] = useState(() => readJson(SESSION_KEY, null));

  function getUsers() {
    return [...seedUsers, ...readJson(USERS_KEY, [])];
  }

  // start a session without keeping the password in it
  function startSession(account) {
    const { password, ...safeUser } = account;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  }

  // todo: replace with fetch to /api/auth/register
  function register({ fullName, email, password, accountType, restaurantCode }) {
    const cleanEmail = email.trim().toLowerCase();

    if (getUsers().some((u) => u.email === cleanEmail)) {
      return { ok: false, error: "Ez az e-mail már foglalt." };
    }

    // only these roles can be requested, super admin never
    const allowed = ["CUSTOMER", "RESTAURANT_ADMIN"];
    const role = allowed.includes(accountType) ? accountType : "CUSTOMER";

    // a restaurant admin needs a valid code that nobody used yet
    let restaurant = null;
    if (role === "RESTAURANT_ADMIN") {
      restaurant = findByCode(restaurantCode);

      if (!restaurant) {
        return { ok: false, error: "Érvénytelen étterem kód." };
      }
      if (restaurant.ownerId) {
        return { ok: false, error: "Ezt a kódot már felhasználták." };
      }
    }

    const account = {
      id: `u-${Date.now()}`,
      fullName,
      email: cleanEmail,
      password,
      role,
      restaurantId: restaurant ? restaurant.id : null,
    };

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([...readJson(USERS_KEY, []), account])
    );

    // the code is used up from now on
    if (restaurant) {
      setOwner(restaurant.id, account.id);
    }

    return { ok: true, user: startSession(account) };
  }

  // todo: replace with fetch to /api/auth/login
  function login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const account = getUsers().find(
      (u) => u.email === cleanEmail && u.password === password
    );

    if (!account) return { ok: false, error: "Hibás e-mail vagy jelszó." };

    return { ok: true, user: startSession(account) };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  // all users without passwords, for the super admin list
  function listUsers() {
    return getUsers().map((account) => {
      const { password, ...safeUser } = account;
      return safeUser;
    });
  }

  // delete a user, the super admin cannot be deleted
  function removeUser(id) {
    const target = getUsers().find((u) => u.id === id);
    if (!target || target.role === "SUPER_ADMIN") return;

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(readJson(USERS_KEY, []).filter((u) => u.id !== id))
    );

    // free the restaurant code again
    if (target.restaurantId) {
      setOwner(target.restaurantId, null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, register, login, logout, listUsers, removeUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// hook so any component can read the logged in user
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}