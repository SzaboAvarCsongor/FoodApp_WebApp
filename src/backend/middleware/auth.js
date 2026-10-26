import { supabase } from '../supabaseClient.js';

// checks the supabase token and loads the profile of the user
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nem vagy bejelentkezve.' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Érvénytelen vagy lejárt belépés.' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profile) return res.status(401).json({ error: 'Nincs ilyen profil.' });

  req.user = profile;
  next();
}

// allow only the given roles, use it after requireAuth
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Nincs jogosultságod.' });
    }
    next();
  };
}