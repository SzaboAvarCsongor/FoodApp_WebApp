import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./AuthModal.css";

function AuthModal({ onClose }) {
  // which form is shown: "login" or "register"
  const [authMode, setAuthMode] = useState("login");

  // values typed into the form
  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    password: "",
    accountType: "CUSTOMER", // CUSTOMER, COURIER or RESTAURANT_ADMIN
  });

  // close the modal with the escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // update one field of the form
  function handleAuthChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  }

  // switch between login and register
  function switchAuthMode() {
    setAuthMode((current) => (current === "login" ? "register" : "login"));
  }

  // submit the form (no backend yet)
  function handleAuthSubmit(event) {
    event.preventDefault();

    // todo: send authForm to the api (/api/auth/login or /api/auth/register)
    // the backend decides the real role, accountType is only a request
    console.log(authMode, authForm);

    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stop clicks inside the card from closing the modal */}
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Bezárás">
          <X size={20} />
        </button>

        <span className="eyebrow">
          {authMode === "login" ? "ÜDVÖZÖLJÜK ÚJRA" : "CSATLAKOZZ HOZZÁNK"}
        </span>
        <h2>{authMode === "login" ? "Bejelentkezés" : "Regisztráció"}</h2>

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

          {/* account type only for registration */}
          {authMode === "register" && (
            <label className="field">
              <span>Milyen fiókot hozol létre?</span>
              <select
                name="accountType"
                value={authForm.accountType}
                onChange={handleAuthChange}
              >
                <option value="CUSTOMER">Vásárló</option>
                <option value="COURIER">Futár</option>
                <option value="RESTAURANT_ADMIN">Étterem</option>
              </select>
            </label>
          )}

          <button className="primary-button auth-submit" type="submit">
            {authMode === "login" ? "Belépés" : "Fiók létrehozása"}
          </button>
        </form>

        {/* switch between login and register */}
        <p className="auth-switch">
          {authMode === "login" ? "Nincs még fiókod?" : "Már van fiókod?"}{" "}
          <button type="button" onClick={switchAuthMode}>
            {authMode === "login" ? "Regisztráció" : "Bejelentkezés"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;