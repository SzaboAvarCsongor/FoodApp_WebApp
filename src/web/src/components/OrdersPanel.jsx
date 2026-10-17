import { useData } from "../context/DataContext";
import { statusLabels, nextStep } from "../data/orderStatus";
import "../pages/OrdersPage.css";

function OrdersPanel({ restaurantId }) {
  const { orders, setOrderStatus } = useData();

  // only the orders of this restaurant
  const myOrders = orders.filter((order) => order.restaurantId === restaurantId);

  return (
    <section className="panel">
      <h2>Rendelések ({myOrders.length})</h2>

      {myOrders.length === 0 ? (
        <p className="panel-empty">Még nem érkezett rendelés.</p>
      ) : (
        <div className="row-list">
          {myOrders.map((order) => {
            const next = nextStep[order.status];
            const canCancel =
              order.status === "PENDING" || order.status === "ACCEPTED";

            return (
              <article className="row-item order-row" key={order.id}>
                <div className="row-main">
                  <h3>
                    {order.customerName} · {order.total} lej
                  </h3>
                  <p>
                    {new Date(order.createdAt).toLocaleString("hu-HU")} ·{" "}
                    {order.address}
                  </p>
                  <p>
                    {order.items
                      .map((item) => `${item.qty} × ${item.name}`)
                      .join(", ")}
                  </p>
                  <div className="row-tags">
                    <span className={`status status-${order.status}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>

                <div className="row-actions">
                  {next && (
                    <button
                      className="mini-button"
                      onClick={() => setOrderStatus(order.id, next.status)}
                    >
                      {next.label}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      className="mini-button danger"
                      onClick={() => setOrderStatus(order.id, "CANCELLED")}
                    >
                      Lemondás
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default OrdersPanel;