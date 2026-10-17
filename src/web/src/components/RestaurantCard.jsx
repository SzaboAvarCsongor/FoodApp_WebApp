import { useNavigate } from "react-router-dom";
import { Clock, Star, Heart } from "lucide-react";
import "./RestaurantCard.css";

function RestaurantCard({ restaurant, isFavorite, onToggleFavorite }) {
  const navigate = useNavigate();

  // open the restaurant page
  function openRestaurant() {
    navigate(`/restaurant/${restaurant.id}`);
  }

  // open with the keyboard too
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      openRestaurant();
    }
  }

  // hide broken images so the emoji fallback is visible
  function handleImageError(event) {
    event.currentTarget.style.display = "none";
  }

  // favorite click must not open the restaurant page
  function handleFavoriteClick(event) {
    event.stopPropagation();
    onToggleFavorite(restaurant.id);
  }

  return (
    <article
      className="restaurant-card"
      onClick={openRestaurant}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
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
          className={`favorite-button ${isFavorite ? "favorited" : ""}`}
          onClick={handleFavoriteClick}
          aria-label="Kedvencekhez adás"
        >
          <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
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
  );
}

export default RestaurantCard;