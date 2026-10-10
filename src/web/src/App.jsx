import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import HomePage from "./pages/HomePage";
import "./App.css";

function App() {
  // search text is shared between the navbar and the home page
  const [search, setSearch] = useState("");

  // number of items in the cart (will be filled from the menu page later)
  const [cartCount] = useState(0);

  // is the auth modal open
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="app">
      <Navbar
        search={search}
        onSearchChange={setSearch}
        cartCount={cartCount}
        onAuthClick={() => setAuthOpen(true)}
      />

      {/* add new pages here, for example /restaurant/:id or /cart */}
      <Routes>
        <Route
          path="/"
          element={<HomePage search={search} onSearchChange={setSearch} />}
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