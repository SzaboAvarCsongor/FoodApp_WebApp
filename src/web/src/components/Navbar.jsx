import { Link } from "react-router-dom";
import { Search, ShoppingBag, MapPin, Utensils, User } from "lucide-react";
import "./Navbar.css";

function Navbar({ search, onSearchChange, cartCount, onAuthClick }) {
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

      {/* cart button */}
      <button
        className="cart-button"
        onClick={() => alert(`Kosár: ${cartCount} tétel`)}
      >
        <ShoppingBag size={19} />
        <span className="cart-label">Kosár</span>
        <span className="cart-count">{cartCount}</span>
      </button>

      {/* sign in / sign up button */}
      <button className="auth-button" onClick={onAuthClick}>
        <User size={19} />
        <span className="auth-label">Bejelentkezés</span>
      </button>
    </header>
  );
}

export default Navbar;