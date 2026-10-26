// food categories shown as chips
export const categories = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Burgerek", emoji: "🍔" },
  { name: "Sushi", emoji: "🍣" },
  { name: "Ázsiai", emoji: "🍜" },
  { name: "Saláták", emoji: "🥗" },
  { name: "Desszertek", emoji: "🍰" },
];

// test data until the backend is ready
// menu item ids must be unique across all restaurants (the cart uses them)
export const restaurants = [
  {
    id: 1,
    name: "Napoli Pizza",
    category: "Pizza",
    rating: 4.8,
    time: "20–30 perc",
    fee: "5 lej",
    color: "#fff0e4",
    emoji: "🍕",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
    menu: [
      { id: 101, name: "Margherita", description: "Paradicsomszósz, mozzarella, bazsalikom", price: 32, category: "Pizzák", calories: 780, protein: 32, carbs: 98, fat: 26 },
      { id: 102, name: "Diavola", description: "Csípős szalámi, mozzarella, paradicsomszósz", price: 38, category: "Pizzák", calories: 920, protein: 40, carbs: 100, fat: 36 },
      { id: 103, name: "Quattro Formaggi", description: "Négyféle sajt, paradicsomszósz", price: 42, category: "Pizzák", calories: 1010, protein: 44, carbs: 96, fat: 45 },
      { id: 104, name: "Tiramisu", description: "Mascarpone krém, kávé, kakaó", price: 18, category: "Desszertek", calories: 430, protein: 7, carbs: 44, fat: 25 },
    ],
  },
  {
    id: 2,
    name: "Burger House",
    category: "Burgerek",
    rating: 4.7,
    time: "25–35 perc",
    fee: "4 lej",
    color: "#fce8d5",
    emoji: "🍔",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    menu: [
      { id: 201, name: "Classic Burger", description: "Marhahús, saláta, paradicsom, szósz", price: 29, category: "Burgerek", calories: 690, protein: 34, carbs: 48, fat: 38 },
      { id: 202, name: "Cheese Burger", description: "Marhahús, cheddar, savanyúság", price: 33, category: "Burgerek", calories: 780, protein: 38, carbs: 50, fat: 45 },
      { id: 203, name: "Sült krumpli", description: "Ropogós, sózott", price: 12, category: "Köretek", calories: 380, protein: 5, carbs: 52, fat: 17 },
      { id: 204, name: "Limonádé", description: "Házi, frissen facsart", price: 10, category: "Italok", calories: 120, protein: 0, carbs: 30, fat: 0 },
    ],
  },
  {
    id: 3,
    name: "Sushi Garden",
    category: "Sushi",
    rating: 4.9,
    time: "30–40 perc",
    fee: "6 lej",
    color: "#e6f0e8",
    emoji: "🍣",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    menu: [
      { id: 301, name: "Lazac nigiri (4 db)", description: "Friss lazac, rizs", price: 34, category: "Sushi", calories: 260, protein: 18, carbs: 34, fat: 6 },
      { id: 302, name: "California roll (8 db)", description: "Rák, avokádó, uborka", price: 36, category: "Sushi", calories: 420, protein: 12, carbs: 68, fat: 11 },
      { id: 303, name: "Miso leves", description: "Tofu, alga, újhagyma", price: 14, category: "Levesek", calories: 90, protein: 6, carbs: 8, fat: 3 },
    ],
  },
  {
    id: 4,
    name: "Green Bowl",
    category: "Saláták",
    rating: 4.6,
    time: "15–25 perc",
    fee: "3 lej",
    color: "#e8f0df",
    emoji: "🥗",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    menu: [
      { id: 401, name: "Csirkés Caesar saláta", description: "Grillcsirke, római saláta, parmezán", price: 30, category: "Saláták", calories: 520, protein: 42, carbs: 22, fat: 28 },
      { id: 402, name: "Quinoa bowl", description: "Quinoa, avokádó, csicseriborsó, spenót", price: 31, category: "Saláták", calories: 560, protein: 20, carbs: 64, fat: 24 },
      { id: 403, name: "Smoothie", description: "Banán, eper, spenót", price: 16, category: "Italok", calories: 210, protein: 4, carbs: 46, fat: 2 },
    ],
  },
];