import { supabase } from '../supabaseClient.js';

// public fields only, the invite code must never be sent to customers
const publicFields =
  'id, name, category, address, image_url, delivery_fee, delivery_time_min, delivery_time_max, is_approved';

// replace the reviews list with the average rating
function withRating(row) {
  const { reviews, ...rest } = row;
  const list = reviews || [];
  const rating = list.length
    ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10
    : 0;
  return { ...rest, rating };
}

export const getRestaurants = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`${publicFields}, reviews(rating)`)
      .eq('is_approved', true);
    if (error) throw error;

    const rows = data.map(withRating).sort((a, b) => b.rating - a.rating);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`${publicFields}, reviews(rating)`)
      .eq('id', id)
      .eq('is_approved', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Étterem nem található' });

    res.status(200).json(withRating(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantMenu = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', id)
      .eq('is_available', true)
      .order('category');

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};