import { useState } from "react";
import { Star, Clock, ArrowRight } from "lucide-react";
import RestaurantCard from "../components/RestaurantCard";
import "./HomePage.css";

// food categories shown as chips
const categories = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Burgerek", emoji: "🍔" },
  { name: "Sushi", emoji: "🍣" },
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
    category: "Sushi",
    rating: 4.9,
    time: "30–40 perc",
    fee: "6 lej",
    color: "#e6f0e8",
    emoji: "🍣",
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

function HomePage({ search, onSearchChange }) {
  // store the selected category
  const [category, setCategory] = useState("Mindegyik");

  // store favorite restaurant ids
  const [favorites, setFavorites] = useState([]);

  // filter restaurants based on search and category
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "Mindegyik" || restaurant.category === category;

    return matchesSearch && matchesCategory;
  });

  // add or remove a restaurant from favorites
  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  return (
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
          <span className="floating-badge badge-bottom">♥ Neked készítve</span>
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
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={favorites.includes(restaurant.id)}
                onToggleFavorite={toggleFavorite}
              />
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
                onSearchChange("");
                setCategory("Mindegyik");
              }}
            >
              Szűrők törlése
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default HomePage;