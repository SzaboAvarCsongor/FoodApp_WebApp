import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Star, Plus, Minus } from "lucide-react";
import { restaurants } from "../data/restaurants";
import "./RestaurantPage.css";

function RestaurantPage({ cart, onAdd, onRemove }) {
  // the id comes from the url: /restaurant/:id
  const { id } = useParams();
  const restaurant = restaurants.find((item) => item.id === Number(id));

  // unknown restaurant id
  if (!restaurant) {
    return (
      <main className="page-placeholder">
        <h1>Nem találjuk az éttermet</h1>
        <p>
          <Link to="/">Vissza a főoldalra</Link>
        </p>
      </main>
    );
  }

  // group menu items by their category, keeping the original order
  const groups = restaurant.menu.reduce((result, item) => {
    if (!result[item.category]) result[item.category] = [];
    result[item.category].push(item);
    return result;
  }, {});

  // how many of an item are in the cart
  function quantityOf(itemId) {
    const found = cart.find((entry) => entry.id === itemId);
    return found ? found.qty : 0;
  }

  // totals of the cart, only if it belongs to this restaurant
  const cartHere = cart.filter((entry) => entry.restaurantId === restaurant.id);
  const totals = cartHere.reduce(
    (sum, entry) => ({
      items: sum.items + entry.qty,
      price: sum.price + entry.price * entry.qty,
      calories: sum.calories + entry.calories * entry.qty,
      protein: sum.protein + entry.protein * entry.qty,
      carbs: sum.carbs + entry.carbs * entry.qty,
      fat: sum.fat + entry.fat * entry.qty,
    }),
    { items: 0, price: 0, calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <main className="restaurant-page">
      <Link className="back-link" to="/">
        <ArrowLeft size={18} /> Vissza az éttermekhez
      </Link>

      {/* restaurant header */}
      <section
        className="restaurant-banner"
        style={{ backgroundColor: restaurant.color }}
      >
        <span className="banner-emoji">{restaurant.emoji}</span>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          onError={(event) => (event.currentTarget.style.display = "none")}
        />
      </section>

      <div className="restaurant-details">
        <div>
          <span className="eyebrow">{restaurant.category.toUpperCase()}</span>
          <h1>{restaurant.name}</h1>
        </div>

        <div className="restaurant-facts">
          <span className="fact rating">
            <Star size={16} fill="currentColor" />
            {restaurant.rating}
          </span>
          <span className="fact">
            <Clock size={16} />
            {restaurant.time}
          </span>
          <span className="fact">Szállítás: {restaurant.fee}</span>
        </div>
      </div>

      {/* menu grouped by category */}
      {Object.entries(groups).map(([groupName, items]) => (
        <section className="menu-group" key={groupName}>
          <h2>{groupName}</h2>

          <div className="menu-list">
            {items.map((item) => {
              const qty = quantityOf(item.id);

              return (
                <article className="menu-item" key={item.id}>
                  <div className="menu-item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>

                    {/* calories and macros */}
                    <div className="macros">
                      <span>{item.calories} kcal</span>
                      <span>F {item.protein} g</span>
                      <span>Sz {item.carbs} g</span>
                      <span>Zs {item.fat} g</span>
                    </div>
                  </div>

                  <div className="menu-item-side">
                    <strong>{item.price} lej</strong>

                    {qty === 0 ? (
                      <button
                        className="add-button"
                        onClick={() => onAdd(restaurant.id, item)}
                      >
                        <Plus size={16} /> Kosárba
                      </button>
                    ) : (
                      <div className="qty-control">
                        <button
                          onClick={() => onRemove(item.id)}
                          aria-label="Kevesebb"
                        >
                          <Minus size={16} />
                        </button>
                        <span>{qty}</span>
                        <button
                          onClick={() => onAdd(restaurant.id, item)}
                          aria-label="Több"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {/* cart summary with calorie and macro totals */}
      {totals.items > 0 && (
        <div className="cart-summary">
          <div>
            <strong>
              {totals.items} tétel · {totals.price} lej
            </strong>
            <span>
              {totals.calories} kcal · F {totals.protein} g · Sz {totals.carbs} g
              · Zs {totals.fat} g
            </span>
          </div>
        </div>
      )}
    </main>
  );
}

export default RestaurantPage;