import { supabase } from '../supabaseClient.js';

// register: the role is decided here, the browser only asks for a type
export const register = async (req, res) => {
  const { fullName, email, password, accountType, restaurantCode } = req.body;

  if (!fullName || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Hiányzó vagy hibás adatok.' });
  }

  // super admin and courier can never be requested here
  const role = accountType === 'RESTAURANT_ADMIN' ? 'RESTAURANT_ADMIN' : 'CUSTOMER';
  const cleanEmail = email.trim().toLowerCase();

  // a restaurant admin needs a valid code that nobody used yet
  let restaurant = null;
  if (role === 'RESTAURANT_ADMIN') {
    const { data } = await supabase
      .from('restaurants')
      .select('id, owner_id')
      .eq('invite_code', (restaurantCode || '').trim().toUpperCase())
      .maybeSingle();

    if (!data) return res.status(400).json({ error: 'Érvénytelen étterem kód.' });
    if (data.owner_id) {
      return res.status(400).json({ error: 'Ezt a kódot már felhasználták.' });
    }
    restaurant = data;
  }

  // create the supabase auth user (the password is hashed by supabase)
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
  });

  if (error) {
    const taken = error.message.toLowerCase().includes('already');
    return res
      .status(400)
      .json({ error: taken ? 'Ez az e-mail már foglalt.' : error.message });
  }

  const userId = created.user.id;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    email: cleanEmail,
    full_name: fullName.trim(),
    role,
    is_approved: true,
  });

  if (profileError) {
    // do not leave an auth user without a profile
    await supabase.auth.admin.deleteUser(userId);
    return res.status(500).json({ error: profileError.message });
  }

  // the code is used up from now on
  if (restaurant) {
    await supabase
      .from('restaurants')
      .update({ owner_id: userId })
      .eq('id', restaurant.id)
      .is('owner_id', null);
  }

  res.status(201).json({ message: 'Sikeres regisztráció.' });
};

// the profile of the logged in user (the web calls this after login)
export const me = async (req, res) => {
  let restaurantId = null;

  if (req.user.role === 'RESTAURANT_ADMIN') {
    const { data } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', req.user.id)
      .maybeSingle();
    restaurantId = data ? data.id : null;
  }

  res.json({
    id: req.user.id,
    fullName: req.user.full_name,
    email: req.user.email,
    role: req.user.role,
    restaurantId,
  });
};