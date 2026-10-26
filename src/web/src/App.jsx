import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import JobsPage from "./pages/JobsPage";
import RestaurantDashboard from "./pages/restaurant-admin/Dashboard";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import "./App.css";

function App() {
  const { user } = useAuth();

  // search text is shared between the navbar and the home page
  const [search, setSearch] = useState("");

  // is the auth modal open
  const [authOpen, setAuthOpen] = useState(false);

  // cart items: { id, name, price, calories, protein, carbs, fat, restaurantId, qty }
  const [cart, setCart] = useState([]);

  // total number of items in the cart
  const cartCount = cart.reduce((sum, entry) => sum + entry.qty, 0);

  // add one item, the cart holds food from a single restaurant only
  function addToCart(restaurantId, item) {
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      const confirmed = window.confirm(
        "A kosárban másik étterem ételei vannak. Kiüríted és újat kezdesz?"
      );
      if (!confirmed) return;

      setCart([{ ...item, restaurantId, qty: 1 }]);
      return;
    }

    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);

      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }

      return [...current, { ...item, restaurantId, qty: 1 }];
    });
  }

  // remove one item, delete the row when it reaches zero
  function removeFromCart(itemId) {
    setCart((current) =>
      current
        .map((entry) =>
          entry.id === itemId ? { ...entry, qty: entry.qty - 1 } : entry
        )
        .filter((entry) => entry.qty > 0)
    );
  }

  // empty the whole cart
  function clearCart() {
    setCart([]);
  }

  // fill the cart with the items of an old order
  function reorder(order) {
    setCart(
      order.items.map((item) => ({ ...item, restaurantId: order.restaurantId }))
    );
  }

  return (
    <div className="app">
      <Navbar
        search={search}
        onSearchChange={setSearch}
        cartCount={cartCount}
        onAuthClick={() => setAuthOpen(true)}
      />

      <Routes>
        <Route
          path="/"
          element={<HomePage search={search} onSearchChange={setSearch} />}
        />

        {/* open for everyone */}
        <Route
          path="/restaurant/:id"
          element={
            <RestaurantPage
              cart={cart}
              onAdd={addToCart}
              onRemove={removeFromCart}
            />
          }
        />

        {/* job board, open for everyone, applying needs login */}
        <Route
          path="/jobs"
          element={<JobsPage onAuthClick={() => setAuthOpen(true)} />}
        />

        {/* cart is visible without login, ordering needs login */}
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              onAdd={addToCart}
              onRemove={removeFromCart}
              onClear={clearCart}
              onAuthClick={() => setAuthOpen(true)}
              user={user}
            />
          }
        />

        {/* order history, customers only */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <OrdersPage onReorder={reorder} />
            </ProtectedRoute>
          }
        />

        {/* restaurant admin only */}
        <Route
          path="/restaurant-admin"
          element={
            <ProtectedRoute roles={["RESTAURANT_ADMIN"]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />

        {/* super admin only */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* unknown urls go back to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />

      {/* the modal is only mounted while open, so its form resets every time */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}

export default App;