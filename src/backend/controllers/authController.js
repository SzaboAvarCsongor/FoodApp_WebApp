import { supabase, supabaseAuth } from '../supabaseClient.js';

export const login = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const { password } = req.body;

  if (!email || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Add meg az e-mail címedet és a jelszavadat.' });
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error?.code === 'invalid_credentials') {
    return res.status(401).json({ error: 'Hibás e-mail cím vagy jelszó.' });
  }
  if (error) {
    console.error('Supabase bejelentkezési hiba:', error.message);
    return res.status(502).json({ error: 'A bejelentkezési szolgáltatás nem érhető el.' });
  }
  if (!data.session) {
    console.error('Supabase bejelentkezés nem adott vissza munkamenetet.');
    return res.status(502).json({ error: 'A bejelentkezési szolgáltatás nem adott vissza munkamenetet.' });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    return res.status(500).json({ error: 'Nem sikerült betölteni a felhasználói profilt.' });
  }
  if (!profile) {
    return res.status(403).json({ error: 'A fiókhoz nem tartozik felhasználói profil.' });
  }

  let restaurantId = null;
  if (profile.role === 'RESTAURANT_ADMIN') {
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', profile.id)
      .maybeSingle();

    if (restaurantError) {
      return res.status(500).json({ error: 'Nem sikerült betölteni az étterem adatait.' });
    }
    restaurantId = restaurant?.id ?? null;
  }

  res.json({
    token: data.session.access_token,
    user: {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      role: profile.role,
      restaurantId,
    },
  });
};

export const register = async (req, res) => {
  const {
    fullName,
    email,
    password,
    accountType,
    restaurantCode,
    vehicleType,
    licensePlate,
  } = req.body;

  if (
    typeof fullName !== 'string' ||
    !fullName.trim() ||
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    password.length < 6
  ) {
    return res.status(400).json({ error: 'Hiányzó vagy hibás adatok.' });
  }
  if (accountType && !['CUSTOMER', 'COURIER', 'RESTAURANT_ADMIN'].includes(accountType)) {
    return res.status(400).json({ error: 'Érvénytelen fióktípus.' });
  }
  if (
    accountType === 'COURIER' &&
    (typeof vehicleType !== 'string' || !vehicleType.trim() || vehicleType.trim().length > 100)
  ) {
    return res.status(400).json({ error: 'Add meg a jármű típusát (legfeljebb 100 karakter).' });
  }
  if (
    accountType === 'COURIER' &&
    licensePlate != null &&
    (typeof licensePlate !== 'string' || licensePlate.trim().length > 50)
  ) {
    return res.status(400).json({ error: 'A rendszám legfeljebb 50 karakter lehet.' });
  }

  const role = accountType || 'CUSTOMER';
  const cleanEmail = email.trim().toLowerCase();

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
    const { error: cleanupError } = await supabase.auth.admin.deleteUser(userId);
    if (cleanupError) {
      console.error('Auth felhasználó takarítási hiba:', cleanupError.message);
    }
    return res.status(500).json({ error: profileError.message });
  }

  if (role === 'COURIER') {
    const { error: courierError } = await supabase.from('courier_details').insert({
      id: userId,
      vehicle_type: vehicleType.trim(),
      license_plate: licensePlate?.trim() || null,
    });

    if (courierError) {
      const { error: profileCleanupError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      const { error: authCleanupError } = await supabase.auth.admin.deleteUser(userId);

      if (profileCleanupError || authCleanupError) {
        console.error('Futárfiók takarítási hiba:', {
          profile: profileCleanupError?.message,
          auth: authCleanupError?.message,
        });
      }

      return res.status(500).json({ error: 'Nem sikerült létrehozni a futárprofilt.' });
    }
  }

  if (restaurant) {
    await supabase
      .from('restaurants')
      .update({ owner_id: userId })
      .eq('id', restaurant.id)
      .is('owner_id', null);
  }

  res.status(201).json({ message: 'Sikeres regisztráció.' });
};

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