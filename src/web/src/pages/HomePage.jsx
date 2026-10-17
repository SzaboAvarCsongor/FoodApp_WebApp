import { useState } from "react";
import { Star, Clock, ArrowRight } from "lucide-react";
import RestaurantCard from "../components/RestaurantCard";
import { categories, restaurants } from "../data/restaurants";
import "./HomePage.css";


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