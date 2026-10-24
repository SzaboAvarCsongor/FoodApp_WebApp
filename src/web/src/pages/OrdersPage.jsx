import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchMyOrders } from "../services/api";
import { statusLabels } from "../data/orderStatus";
import "./Dashboard.css";
import "./OrdersPage.css";

function OrdersPage({ onReorder }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // load the orders of the logged in customer from the database
  useEffect(() => {
    fetchMyOrders(user.id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  // fill the cart again and open it
  function handleReorder(order) {
    onReorder(order);
    navigate("/cart");
  }

  return (
    <main className="orders-page">
      <div className="dash-header">
        <span className="eyebrow">RENDELÉSEIM</span>
        <h1>Korábbi rendelések</h1>
      </div>

      {loading ? (
        <p className="panel-empty">Betöltés...</p>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span>📦</span>
          <h3>Még nincs rendelésed</h3>
          <p>Ha leadsz egy rendelést, itt fogod követni.</p>
          <Link className="primary-button" to="/">
            Éttermek megtekintése
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-top">
                <div>
                  <h3>
                    {order.restaurantEmoji} {order.restaurantName}
                  </h3>
                  <p>
                    {new Date(order.createdAt).toLocaleString("hu-HU")} ·{" "}
                    {order.address}
                  </p>
                </div>
                <span className={`status status-${order.status}`}>
                  {statusLabels[order.status]}
                </span>
              </div>

              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.qty} × {item.name}
                    </span>
                    <span>{item.price * item.qty} lej</span>
                  </li>
                ))}
              </ul>

              <div className="order-bottom">
                <div>
                  <strong>Összesen: {order.total} lej</strong>
                  <span>
                    {order.calories} kcal · szállítás {order.deliveryFee} lej
                  </span>
                </div>
                <button
                  className="reorder-button"
                  onClick={() => handleReorder(order)}
                >
                  <RotateCcw size={16} /> Újrarendelés
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default OrdersPage;