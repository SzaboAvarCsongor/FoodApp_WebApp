import { createContext, useContext, useState, useEffect } from "react";
import { restaurants as seedRestaurants } from "../data/restaurants";

const DataContext = createContext(null);

const RESTAURANTS_KEY = "foodapp_restaurants";
const ORDERS_KEY = "foodapp_orders";
const JOBS_KEY = "foodapp_jobs";

// invite codes of the test restaurants
const seedCodes = {
  1: "NAPOLI-4821",
  2: "BURGER-1234",
  3: "SUSHI-5566",
  4: "GREEN-7788",
};

// seed restaurants get a code, an owner slot and an active flag
const initialRestaurants = seedRestaurants.map((restaurant) => ({
  ...restaurant,
  code: seedCodes[restaurant.id],
  ownerId: null,
  active: true,
}));

// state that is saved to localstorage on every change
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage can be full or blocked, the app still works without saving
    }
  }, [key, value]);

  return [value, setValue];
}

// make a code like NAPOLI-4821 from the restaurant name
function generateCode(name) {
  const letters = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${letters || "REST"}-${digits}`;
}

export function DataProvider({ children }) {
  const [restaurants, setRestaurants] = useStored(
    RESTAURANTS_KEY,
    initialRestaurants
  );
  const [orders, setOrders] = useStored(ORDERS_KEY, []);
  const [jobs, setJobs] = useStored(JOBS_KEY, []);

  // only active restaurants are shown to customers
  const publicRestaurants = restaurants.filter((r) => r.active);

  // ---------- restaurants ----------

  // todo: replace with fetch to /api/restaurants
  function addRestaurant({ name, category, emoji, fee, time, image }) {
    const restaurant = {
      id: Date.now(),
      name,
      category,
      rating: 0,
      time,
      fee: `${fee} lej`,
      color: "#fff0e4",
      emoji,
      image:
        image ||
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      menu: [],
      code: generateCode(name),
      ownerId: null,
      active: true,
    };

    setRestaurants((current) => [...current, restaurant]);
    return restaurant;
  }

  function removeRestaurant(id) {
    setRestaurants((current) => current.filter((r) => r.id !== id));
    // jobs of a deleted restaurant make no sense anymore
    setJobs((current) => current.filter((job) => job.restaurantId !== id));
  }

  // show or hide a restaurant for customers
  function toggleActive(id) {
    setRestaurants((current) =>
      current.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  }

  // link a user to a restaurant (null frees the restaurant again)
  function setOwner(id, ownerId) {
    setRestaurants((current) =>
      current.map((r) => (r.id === id ? { ...r, ownerId } : r))
    );
  }

  // find a restaurant by its invite code
  function findByCode(code) {
    return restaurants.find((r) => r.code === code);
  }

  function addMenuItem(restaurantId, item) {
    setRestaurants((current) =>
      current.map((r) =>
        r.id === restaurantId
          ? { ...r, menu: [...r.menu, { ...item, id: Date.now() }] }
          : r
      )
    );
  }

  function removeMenuItem(restaurantId, itemId) {
    setRestaurants((current) =>
      current.map((r) =>
        r.id === restaurantId
          ? { ...r, menu: r.menu.filter((item) => item.id !== itemId) }
          : r
      )
    );
  }

  // ---------- orders ----------

  // todo: replace with fetch to POST /api/orders
  function placeOrder({ customer, restaurant, items, deliveryFee, address }) {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const calories = items.reduce((sum, i) => sum + i.calories * i.qty, 0);

    const order = {
      id: `o-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.fullName,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantEmoji: restaurant.emoji,
      // prices are saved at order time, later menu changes must not affect them
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        category: i.category,
        price: i.price,
        qty: i.qty,
        calories: i.calories,
        protein: i.protein,
        carbs: i.carbs,
        fat: i.fat,
      })),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      calories,
      address,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setOrders((current) => [order, ...current]);
    return order;
  }

  // todo: replace with fetch to PATCH /api/orders/:id/status
  function setOrderStatus(orderId, status) {
    setOrders((current) =>
      current.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }

  // ---------- jobs ----------

  // todo: replace with fetch to POST /api/jobs
  function addJob(restaurantId, { title, type, description }) {
    const job = {
      id: `j-${Date.now()}`,
      restaurantId,
      title,
      type,
      description,
      createdAt: new Date().toISOString(),
      applications: [],
    };

    setJobs((current) => [job, ...current]);
  }

  function removeJob(jobId) {
    setJobs((current) => current.filter((job) => job.id !== jobId));
  }

  // todo: replace with fetch to POST /api/jobs/:id/apply
  function applyToJob(jobId, { userId, name, message, cvUrl }) {
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              applications: [
                ...job.applications,
                {
                  id: `a-${Date.now()}`,
                  userId,
                  name,
                  message,
                  cvUrl,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : job
      )
    );
  }

  return (
    <DataContext.Provider
      value={{
        restaurants,
        publicRestaurants,
        addRestaurant,
        removeRestaurant,
        toggleActive,
        setOwner,
        findByCode,
        addMenuItem,
        removeMenuItem,
        orders,
        placeOrder,
        setOrderStatus,
        jobs,
        addJob,
        removeJob,
        applyToJob,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// hook so any component can read and change the shared data
// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  return useContext(DataContext);
}