import { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  MapPin,
  Clock,
  Star,
  Heart,
  ArrowRight,
  Utensils,
  User,
  X,
} from "lucide-react";
import "./App.css";

// food categories shown as chips
const categories = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Burgerek", emoji: "🍔" },
  { name: "Ázsiai", emoji: "🍜" },
  { name: "Saláták", emoji: "🥗" },
  { name: "Desszertek", emoji: "🍰" },
];

// test data until the backend is ready
const restaurants = [
  {
    id: 1,
    name: "Napoli Pizza",
    category: "Pizza",
    rating: 4.8,
    time: "20–30 perc",
    fee: "5 lej",
    color: "#fff0e4",
    emoji: "🍕",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Burger House",
    category: "Burgerek",
    rating: 4.7,
    time: "25–35 perc",
    fee: "4 lej",
    color: "#fce8d5",
    emoji: "🍔",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Sushi Garden",
    category: "Ázsiai",
    rating: 4.9,
    time: "30–40 perc",
    fee: "6 lej",
    color: "#e6f0e8",
    emoji: "🍜",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Green Bowl",
    category: "Saláták",
    rating: 4.6,
    time: "15–25 perc",
    fee: "3 lej",
    color: "#e8f0df",
    emoji: "🥗",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  },
];

function App() {
  // store the search input value
  const [search, setSearch] = useState("");

  // store the selected category
  const [category, setCategory] = useState("Mindegyik");

  // store favorite restaurant ids
  const [favorites, setFavorites] = useState([]);

  // number of items in the cart (will be filled from the menu page later)
  const [cartCount] = useState(0);

  // is the auth modal open
  const [authOpen, setAuthOpen] = useState(false);

  // which form is shown in the modal: "login" or "register"
  const [authMode, setAuthMode] = useState("login");

  // store the values typed into the auth form
  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // filter restaurants based on search and category
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "Mindegyik" || restaurant.category === category;

    return matchesSearch && matchesCategory;
  });

  // close the modal with the escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setAuthOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // add or remove a restaurant from favorites
  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  // hide broken images so the emoji fallback is visible
  function handleImageError(event) {
    event.currentTarget.style.display = "none";
  }

  // open the modal in login mode
  function openAuth() {
    setAuthMode("login");
    setAuthOpen(true);
  }

  // update one field of the auth form
  function handleAuthChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  }

  // switch between login and register
  function switchAuthMode() {
    setAuthMode((current) => (current === "login" ? "register" : "login"));
  }

  // submit the auth form (no backend yet)
  function handleAuthSubmit(event) {
    event.preventDefault();

    // todo: send authForm to the api (/api/auth/login or /api/auth/register)
    console.log(authMode, authForm);

    setAuthOpen(false);
  }

  return (
    <div className="app">
      {/* top navigation bar */}
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Utensils size={22} />
          </span>
          <span>
            food<span className="brand-accent">app</span>
          </span>
        </a>

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
            onChange={(event) => setSearch(event.target.value)}
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
        <button className="auth-button" onClick={openAuth}>
          <User size={19} />
          <span className="auth-label">Bejelentkezés</span>
        </button>
      </header>

      <main>
        {/* hero section */}
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">JÓ ÉTVÁGYAT! ✨</span>

            <h1>
              A kedvenc ételed,
              <br />
              <span>egyenesen hozzád.</span>
            </h1>

            <p>
              Fedezd fel a környéked legjobb éttermeit, és rendelj néhány
              kattintással.
            </p>

            {/* scroll down to the restaurant list */}
            <button
              className="primary-button"
              onClick={() =>
                document
                  .getElementById("restaurants")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Éttermek felfedezése <ArrowRight size={18} />
            </button>

            <div className="hero-trust">
              <span>
                <Star size={16} fill="currentColor" />
                Kiváló éttermek
              </span>
              <span>
                <Clock size={16} />
                Gyors kiszállítás
              </span>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-circle">🍕</div>
            <span className="floating-badge badge-top">Friss és finom!</span>
            <span className="floating-badge badge-bottom">
              ♥ Neked készítve
            </span>
          </div>
        </section>

        {/* category filter */}
        <section className="categories-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MIT KÍVÁNSZ?</span>
              <h2>Válassz kategóriát</h2>
            </div>
          </div>

          <div className="categories">
            <button
              className={`category-chip ${
                category === "Mindegyik" ? "active" : ""
              }`}
              onClick={() => setCategory("Mindegyik")}
            >
              <span>🍽️</span> Mindegyik
            </button>

            {categories.map((item) => (
              <button
                key={item.name}
                className={`category-chip ${
                  category === item.name ? "active" : ""
                }`}
                onClick={() => setCategory(item.name)}
              >
                <span>{item.emoji}</span>
                {item.name}
              </button>
            ))}
          </div>
        </section>

        {/* restaurant list */}
        <section className="restaurants-section" id="restaurants">
          <div className="section-heading">
            <div>
              <span className="eyebrow">VÁLOGATOTT NEKED</span>
              <h2>Népszerű éttermek</h2>
            </div>

            <span className="results-count">
              {filteredRestaurants.length} étterem
            </span>
          </div>

          {filteredRestaurants.length > 0 ? (
            <div className="restaurant-grid">
              {filteredRestaurants.map((restaurant) => (
                <article className="restaurant-card" key={restaurant.id}>
                  <div
                    className="restaurant-image"
                    style={{ backgroundColor: restaurant.color }}
                  >
                    {/* emoji fallback behind the photo */}
                    <span className="food-fallback">{restaurant.emoji}</span>

                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      onError={handleImageError}
                    />

                    {/* favorite toggle */}
                    <button
                      className={`favorite-button ${
                        favorites.includes(restaurant.id) ? "favorited" : ""
                      }`}
                      onClick={() => toggleFavorite(restaurant.id)}
                      aria-label="Kedvencekhez adás"
                    >
                      <Heart
                        size={19}
                        fill={
                          favorites.includes(restaurant.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    {/* estimated delivery time */}
                    <span className="delivery-time">
                      <Clock size={14} />
                      {restaurant.time}
                    </span>
                  </div>

                  <div className="restaurant-info">
                    <div className="restaurant-title-row">
                      <h3>{restaurant.name}</h3>
                      <span className="rating">
                        <Star size={15} fill="currentColor" />
                        {restaurant.rating}
                      </span>
                    </div>

                    <p className="restaurant-category">{restaurant.category}</p>

                    <div className="restaurant-footer">
                      <span>Szállítás: {restaurant.fee}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            // shown when nothing matches the filters
            <div className="empty-state">
              <span>🔎</span>
              <h3>Nem találtunk éttermet</h3>
              <p>Próbálj más keresési kifejezést vagy kategóriát!</p>
              <button
                className="primary-button"
                onClick={() => {
                  setSearch("");
                  setCategory("Mindegyik");
                }}
              >
                Szűrők törlése
              </button>
            </div>
          )}
        </section>
      </main>

      {/* footer */}
      <footer className="footer">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Utensils size={20} />
          </span>
          <span>
            food<span className="brand-accent">app</span>
          </span>
        </a>
        <p>Finom ételek, egyszerű rendelés.</p>
        <span>© 2026 FoodApp</span>
      </footer>

      {/* auth modal, only rendered when open */}
      {authOpen && (
        <div
          className="modal-overlay"
          onClick={() => setAuthOpen(false)}
        >
          {/* stop clicks inside the card from closing the modal */}
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setAuthOpen(false)}
              aria-label="Bezárás"
            >
              <X size={20} />
            </button>

            <span className="eyebrow">
              {authMode === "login" ? "ÜDVÖZÖLJÜK ÚJRA" : "CSATLAKOZZ HOZZÁNK"}
            </span>
            <h2>
              {authMode === "login" ? "Bejelentkezés" : "Regisztráció"}
            </h2>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {/* full name only for registration */}
              {authMode === "register" && (
                <label className="field">
                  <span>Teljes név</span>
                  <input
                    type="text"
                    name="fullName"
                    value={authForm.fullName}
                    onChange={handleAuthChange}
                    placeholder="Kovács Anna"
                    required
                  />
                </label>
              )}

              <label className="field">
                <span>E-mail</span>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  placeholder="pelda@email.com"
                  required
                />
              </label>

              <label className="field">
                <span>Jelszó</span>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </label>

              <button className="primary-button auth-submit" type="submit">
                {authMode === "login" ? "Belépés" : "Fiók létrehozása"}
              </button>
            </form>

            {/* switch between login and register */}
            <p className="auth-switch">
              {authMode === "login"
                ? "Nincs még fiókod?"
                : "Már van fiókod?"}{" "}
              <button type="button" onClick={switchAuthMode}>
                {authMode === "login" ? "Regisztráció" : "Bejelentkezés"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;