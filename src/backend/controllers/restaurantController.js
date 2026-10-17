import { supabase } from '../supabaseClient.js';

export const getRestaurants = async (req, res) => {
  try {
    const { data, error } = await supabase.from('restaurants').select('*');
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Étterem nem található' });

    res.status(200).json(data);
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
      .eq('restaurant_id', id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};