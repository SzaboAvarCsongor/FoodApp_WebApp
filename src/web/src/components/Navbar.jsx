import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  MapPin,
  Utensils,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth, homePathForRole } from "../context/AuthContext";
import "./Navbar.css";

function Navbar({ search, onSearchChange, cartCount, onAuthClick }) {
  const { user, logout } = useAuth();

  // customers have no dashboard, they stay on the home page
  const dashboardPath = user ? homePathForRole(user.role) : "/";
  const hasDashboard = user && dashboardPath !== "/";

  return (
    <header className="navbar">
      {/* logo, links to the home page */}
      <Link className="brand" to="/">
        <span className="brand-icon">
          <Utensils size={22} />
        </span>
        <span>
          food<span className="brand-accent">app</span>
        </span>
      </Link>

      {/* delivery address placeholder */}
      <div className="delivery-location">
        <MapPin size={18} />
        <div>
          <span className="muted-label">Kiszállítás ide</span>
          <strong>Válassz címet</strong>
        </div>
      </div>

      {/* search field */}
      <label className="nav-search">
        <Search size={19} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Étterem keresése..."
        />
      </label>

      {/* job board */}
      <Link className="nav-link" to="/jobs">
        Állások
      </Link>

      {/* order history, customers only */}
      {user && user.role === "CUSTOMER" && (
        <Link className="nav-link" to="/orders">
          Rendeléseim
        </Link>
      )}

      {/* cart link */}
      <Link className="cart-button" to="/cart">
        <ShoppingBag size={19} />
        <span className="cart-label">Kosár</span>
        <span className="cart-count">{cartCount}</span>
      </Link>

      {user ? (
        <>
          {/* link to the role dashboard */}
          {hasDashboard && (
            <Link className="auth-button" to={dashboardPath}>
              <LayoutDashboard size={19} />
              <span className="auth-label">Felület</span>
            </Link>
          )}

          {/* user name and logout */}
          <button className="auth-button" onClick={logout}>
            <LogOut size={19} />
            <span className="auth-label">
              {user.fullName.split(" ")[0]} · Kilépés
            </span>
          </button>
        </>
      ) : (
        /* sign in / sign up button */
        <button className="auth-button" onClick={onAuthClick}>
          <User size={19} />
          <span className="auth-label">Bejelentkezés</span>
        </button>
      )}
    </header>
  );
}

export default Navbar;