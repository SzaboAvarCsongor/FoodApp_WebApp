import { supabase } from '../supabaseClient.js';

// make a code like NAPOLI-4821 from the restaurant name
function generateCode(name) {
  const letters = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'REST';
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${letters}-${digits}`;
}

const adminFields =
  'id, name, category, address, image_url, delivery_fee, delivery_time_min, delivery_time_max, is_approved, owner_id, invite_code';

// ---------- super admin: restaurants ----------

export const listAllRestaurants = async (req, res) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select(`${adminFields}, menu_items(id)`)
    .order('created_at');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createRestaurant = async (req, res) => {
  const { name, category, address, fee, minTime, maxTime, image } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Hiányzó név vagy kategória.' });
  }

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name,
      category,
      address: address || 'Nincs megadva',
      image_url: image || null,
      delivery_fee: fee ?? 0,
      delivery_time_min: minTime ?? 20,
      delivery_time_max: maxTime ?? 30,
      is_approved: true,
      invite_code: generateCode(name),
    })
    .select(`${adminFields}, menu_items(id)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// show or hide a restaurant for customers
export const toggleRestaurant = async (req, res) => {
  const { data: current } = await supabase
    .from('restaurants')
    .select('is_approved')
    .eq('id', req.params.id)
    .maybeSingle();

  if (!current) return res.status(404).json({ error: 'Nincs ilyen étterem.' });

  const { error } = await supabase
    .from('restaurants')
    .update({ is_approved: !current.is_approved })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Frissítve.' });
};

export const deleteRestaurant = async (req, res) => {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    return res.status(400).json({
      error: 'Nem törölhető (már vannak rendelések hozzá). Inkább rejtsd el.',
    });
  }
  res.json({ message: 'Törölve.' });
};

// ---------- super admin: users ----------

export const listUsers = async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .order('created_at');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .maybeSingle();

  if (!target) return res.status(404).json({ error: 'Nincs ilyen felhasználó.' });
  if (target.role === 'SUPER_ADMIN') {
    return res.status(400).json({ error: 'A szuperadmin nem törölhető.' });
  }

  // free the restaurant of this user, otherwise the delete would remove it too
  await supabase.from('restaurants').update({ owner_id: null }).eq('owner_id', id);

  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) {
    return res.status(400).json({
      error: 'Nem törölhető (már vannak rendelései).',
    });
  }

  await supabase.auth.admin.deleteUser(id);
  res.json({ message: 'Törölve.' });
};

// ---------- restaurant admin: own restaurant and menu ----------

// find the restaurant of the logged in admin
async function findMine(userId) {
  const { data } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();
  return data;
}

export const getMyRestaurant = async (req, res) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select(`${adminFields}, menu_items(*)`)
    .eq('owner_id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (data) {
    data.menu_items = data.menu_items.filter((item) => item.is_available);
  }
  res.json(data);
};

export const addMenuItem = async (req, res) => {
  const mine = await findMine(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Nincs étterem a fiókodhoz.' });

  const { name, description, price, category, calories, protein, carbs, fat } = req.body;
  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Hiányzó adatok.' });
  }

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      restaurant_id: mine.id,
      name,
      description: description || null,
      price,
      category,
      calories,
      protein,
      carbs,
      fat,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const deleteMenuItem = async (req, res) => {
  const mine = await findMine(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Nincs étterem a fiókodhoz.' });

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', req.params.itemId)
    .eq('restaurant_id', mine.id);

  // already ordered items cannot be deleted, they are hidden instead
  if (error) {
    await supabase
      .from('menu_items')
      .update({ is_available: false })
      .eq('id', req.params.itemId)
      .eq('restaurant_id', mine.id);
  }

  res.json({ message: 'Törölve.' });
};