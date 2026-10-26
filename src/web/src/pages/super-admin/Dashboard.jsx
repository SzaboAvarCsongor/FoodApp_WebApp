import { useState, useEffect } from "react";
import {
  BarChart3,
  Store,
  Users,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { categories } from "../../data/restaurants";
import { fetchUsers, deleteUser } from "../../services/api";
import "../Dashboard.css";

// readable role names
const roleLabels = {
  CUSTOMER: "Vásárló",
  COURIER: "Futár",
  RESTAURANT_ADMIN: "Étterem admin",
  SUPER_ADMIN: "Szuperadmin",
};

function SuperAdminDashboard() {
  const { user } = useAuth();
  const { adminRestaurants: restaurants, addRestaurant, removeRestaurant, toggleActive } =
    useData();

  // which tab is open: "stats", "restaurants" or "users"
  const [tab, setTab] = useState("stats");

  // users come from the database
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  // form to add a new restaurant
  const [form, setForm] = useState({
    name: "",
    category: categories[0].name,
    fee: "5",
    time: "20–30 perc",
    image: "",
  });

  // the code of the restaurant that was just created
  const [createdRestaurant, setCreatedRestaurant] = useState(null);

  // update one field of the form
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // create the restaurant and show its code
  async function handleAddRestaurant(event) {
    event.preventDefault();
    try {
      const created = await addRestaurant({
        name: form.name.trim(),
        category: form.category,
        fee: Number(form.fee) || 0,
        time: form.time.trim(),
        image: form.image.trim(),
      });
      setCreatedRestaurant(created);
      setForm((current) => ({ ...current, name: "", image: "" }));
    } catch (err) {
      alert(err.message);
    }
  }

  // delete a restaurant after confirmation
  function handleRemoveRestaurant(restaurant) {
    if (window.confirm(`Biztosan törlöd: ${restaurant.name}?`)) {
      removeRestaurant(restaurant.id);
    }
  }

  // delete a user after confirmation
  async function handleRemoveUser(target) {
    if (!window.confirm(`Biztosan törlöd: ${target.fullName}?`)) return;
    try {
      await deleteUser(target.id);
      setUsers(await fetchUsers());
    } catch (err) {
      alert(err.message);
    }
  }

  // copy the code to the clipboard
  function copyCode(code) {
    navigator.clipboard?.writeText(code);
  }

  // numbers for the stats tab
  const menuItemCount = restaurants.reduce((sum, r) => sum + r.menu.length, 0);
  const customerCount = users.filter((u) => u.role === "CUSTOMER").length;
  const adminCount = users.filter((u) => u.role === "RESTAURANT_ADMIN").length;
  const activeCount = restaurants.filter((r) => r.active).length;

  const stats = [
    { label: "Étterem", value: restaurants.length },
    { label: "Aktív étterem", value: activeCount },
    { label: "Étel összesen", value: menuItemCount },
    { label: "Vásárló", value: customerCount },
    { label: "Étterem admin", value: adminCount },
    { label: "Felhasználó összesen", value: users.length },
  ];

  return (
    <main className="dash">
      <div className="dash-header">
        <span className="eyebrow">SZUPERADMIN</span>
        <h1>Szia, {user.fullName.split(" ")[0]}!</h1>
        <p>Itt kezelheted az éttermeket és a felhasználókat.</p>
      </div>

      {/* tabs */}
      <div className="dash-tabs">
        <button
          className={`dash-tab ${tab === "stats" ? "active" : ""}`}
          onClick={() => setTab("stats")}
        >
          <BarChart3 size={17} /> Statisztika
        </button>
        <button
          className={`dash-tab ${tab === "restaurants" ? "active" : ""}`}
          onClick={() => setTab("restaurants")}
        >
          <Store size={17} /> Éttermek
        </button>
        <button
          className={`dash-tab ${tab === "users" ? "active" : ""}`}
          onClick={() => setTab("users")}
        >
          <Users size={17} /> Felhasználók
        </button>
      </div>

      {/* stats tab */}
      {tab === "stats" && (
        <section className="stat-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>
      )}

      {/* restaurants tab */}
      {tab === "restaurants" && (
        <>
          <section className="panel">
            <h2>Új étterem felvétele</h2>

            <form className="form-grid" onSubmit={handleAddRestaurant}>
              <label className="field">
                <span>Étterem neve</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Pl. Pasta Palace"
                  required
                />
              </label>

              <label className="field">
                <span>Kategória</span>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {categories.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Szállítási díj (lej)</span>
                <input
                  type="number"
                  min="0"
                  name="fee"
                  value={form.fee}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field">
                <span>Szállítási idő</span>
                <input
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="field form-wide">
                <span>Kép linkje (nem kötelező)</span>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>

              <button className="primary-button form-wide" type="submit">
                <Plus size={18} /> Étterem létrehozása
              </button>
            </form>

            {/* the code is shown right after creating the restaurant */}
            {createdRestaurant && (
              <div className="notice">
                <div>
                  <strong>{createdRestaurant.name}</strong> létrejött. Add át ezt
                  a kódot az étterem tulajdonosának:
                </div>
                <div className="code-row">
                  <span className="code-badge">{createdRestaurant.code}</span>
                  <button
                    className="icon-button"
                    onClick={() => copyCode(createdRestaurant.code)}
                    aria-label="Kód másolása"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Éttermek ({restaurants.length})</h2>

            <div className="row-list">
              {restaurants.map((restaurant) => (
                <article className="row-item" key={restaurant.id}>
                  <div className="row-main">
                    <h3>
                      {restaurant.emoji} {restaurant.name}
                    </h3>
                    <p>
                      {restaurant.category} · {restaurant.menu.length} étel
                    </p>
                    <div className="row-tags">
                      <span className="code-badge">{restaurant.code}</span>
                      <span
                        className={`badge ${
                          restaurant.ownerId ? "badge-ok" : "badge-wait"
                        }`}
                      >
                        {restaurant.ownerId ? "Admin regisztrált" : "Kód még nincs használva"}
                      </span>
                      {!restaurant.active && (
                        <span className="badge badge-off">Elrejtve</span>
                      )}
                    </div>
                  </div>

                  <div className="row-actions">
                    <button
                      className="icon-button"
                      onClick={() => copyCode(restaurant.code)}
                      aria-label="Kód másolása"
                      title="Kód másolása"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => toggleActive(restaurant.id)}
                      aria-label="Megjelenítés váltása"
                      title={restaurant.active ? "Elrejtés" : "Megjelenítés"}
                    >
                      {restaurant.active ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => handleRemoveRestaurant(restaurant)}
                      aria-label="Törlés"
                      title="Törlés"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* users tab */}
      {tab === "users" && (
        <section className="panel">
          <h2>Felhasználók ({users.length})</h2>

          <div className="row-list">
            {users.map((account) => (
              <article className="row-item" key={account.id}>
                <div className="row-main">
                  <h3>{account.fullName}</h3>
                  <p>{account.email}</p>
                  <div className="row-tags">
                    <span className="badge badge-role">
                      {roleLabels[account.role]}
                    </span>
                  </div>
                </div>

                {/* the super admin cannot be deleted */}
                {account.role !== "SUPER_ADMIN" && (
                  <div className="row-actions">
                    <button
                      className="icon-button danger"
                      onClick={() => handleRemoveUser(account)}
                      aria-label="Törlés"
                      title="Törlés"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default SuperAdminDashboard;