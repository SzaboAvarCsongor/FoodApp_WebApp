import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <Link className="brand" to="/">
        <span className="brand-icon">
          <Utensils size={20} />
        </span>
        <span>
          food<span className="brand-accent">app</span>
        </span>
      </Link>
      <p>Finom ételek, egyszerű rendelés.</p>
      <span>© 2026 FoodApp</span>
    </footer>
  );
}

export default Footer;