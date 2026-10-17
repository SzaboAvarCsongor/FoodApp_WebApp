import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, LogIn, ArrowLeft } from "lucide-react";
import { useData } from "../context/DataContext";
import "./CartPage.css";

// user is null when nobody is logged in, it comes from AuthContext via App.jsx
function CartPage({ cart, onAdd, onRemove, onClear, onAuthClick, user = null }) {
  const { restaurants, placeOrder } = useData();
  const navigate = useNavigate();

  // delivery address typed by the customer
  const [address, setAddress] = useState("");

  // empty cart
  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-state">
          <span>🛒</span>
          <h3>A kosarad üres</h3>
          <p>Válassz egy éttermet, és tegyél be valamit a kosárba.</p>
          <Link className="primary-button" to="/">
            Éttermek megtekintése
          </Link>
        </div>
      </main>
    );
  }

  // the cart holds one restaurant only
  const restaurant = restaurants.find((r) => r.id === cart[0].restaurantId);
  const deliveryFee = restaurant ? parseInt(restaurant.fee, 10) || 0 : 0;

  // totals of price, calories and macros
  const totals = cart.reduce(
    (sum, entry) => ({
      price: sum.price + entry.price * entry.qty,
      calories: sum.calories + entry.calories * entry.qty,
      protein: sum.protein + entry.protein * entry.qty,
      carbs: sum.carbs + entry.carbs * entry.qty,
      fat: sum.fat + entry.fat * entry.qty,
    }),
    { price: 0, calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // save the order, empty the cart and open the order history
  function handleOrder(event) {
    event.preventDefault();

    placeOrder({
      customer: user,
      restaurant,
      items: cart,
      deliveryFee,
      address: address.trim(),
    });

    onClear();
    navigate("/orders");
  }

  return (
    <main className="cart-page">
      <Link
        className="back-link"
        to={restaurant ? `/restaurant/${restaurant.id}` : "/"}
      >
        <ArrowLeft size={18} /> Vissza az étlaphoz
      </Link>

      <div className="cart-heading">
        <div>
          <span className="eyebrow">KOSÁR</span>
          <h1>{restaurant ? restaurant.name : "Rendelésed"}</h1>
        </div>
        <button className="clear-button" onClick={onClear}>
          <Trash2 size={16} /> Kosár ürítése
        </button>
      </div>

      {/* items with their calories and macros */}
      <section className="cart-list">
        {cart.map((entry) => (
          <article className="cart-item" key={entry.id}>
            <div className="cart-item-info">
              <h3>{entry.name}</h3>
              <div className="macros">
                <span>{entry.calories * entry.qty} kcal</span>
                <span>F {entry.protein * entry.qty} g</span>
                <span>Sz {entry.carbs * entry.qty} g</span>
                <span>Zs {entry.fat * entry.qty} g</span>
              </div>
            </div>

            <div className="cart-item-side">
              <strong>{entry.price * entry.qty} lej</strong>
              <div className="qty-control">
                <button
                  onClick={() => onRemove(entry.id)}
                  aria-label="Kevesebb"
                >
                  <Minus size={16} />
                </button>
                <span>{entry.qty}</span>
                <button
                  onClick={() => onAdd(entry.restaurantId, entry)}
                  aria-label="Több"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* nutrition totals */}
      <section className="nutrition-box">
        <h2>Tápérték összesen</h2>
        <div className="nutrition-grid">
          <div>
            <strong>{totals.calories}</strong>
            <span>kcal</span>
          </div>
          <div>
            <strong>{totals.protein} g</strong>
            <span>fehérje</span>
          </div>
          <div>
            <strong>{totals.carbs} g</strong>
            <span>szénhidrát</span>
          </div>
          <div>
            <strong>{totals.fat} g</strong>
            <span>zsír</span>
          </div>
        </div>
      </section>

      {/* price summary */}
      <section className="price-box">
        <div>
          <span>Részösszeg</span>
          <span>{totals.price} lej</span>
        </div>
        <div>
          <span>Szállítás</span>
          <span>{deliveryFee} lej</span>
        </div>
        <div className="price-total">
          <span>Összesen</span>
          <span>{totals.price + deliveryFee} lej</span>
        </div>
      </section>

      {/* order form for customers, note for other roles, login box when logged out */}
      {user ? (
        user.role === "CUSTOMER" ? (
          <form className="order-form" onSubmit={handleOrder}>
            <label className="field">
              <span>Szállítási cím</span>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Utca, házszám, város"
                required
              />
            </label>
            <button className="primary-button order-button" type="submit">
              Rendelés leadása · {totals.price + deliveryFee} lej
            </button>
          </form>
        ) : (
          <p className="order-note">Rendelni csak vásárlói fiókkal lehet.</p>
        )
      ) : (
        <section className="login-box">
          <LogIn size={26} />
          <div>
            <h3>Jelentkezz be a rendeléshez</h3>
            <p>
              A kosarad megmarad. Nincs még fiókod? Regisztrálj pár másodperc
              alatt.
            </p>
          </div>
          <button className="primary-button" onClick={onAuthClick}>
            Bejelentkezés / Regisztráció
          </button>
        </section>
      )}
    </main>
  );
}

export default CartPage;