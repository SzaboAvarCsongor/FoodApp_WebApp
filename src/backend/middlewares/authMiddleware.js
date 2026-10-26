import { supabase } from '../supabaseClient.js';

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Hozzáférés megtagadva. Hiányzó vagy érvénytelen token.',
      });
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Érvénytelen vagy lejárt munkamenet (token).',
      });
    }

    const role = user.app_metadata?.role || user.user_metadata?.role || 'customer';

    req.user = {
      id: user.id,
      email: user.email,
      role: role,
    };

    next();
  } catch (err) {
    console.error('Auth middleware hiba:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Szerveroldali hiba a hitelesítés során.',
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Nem azonosított felhasználó.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Tiltott hozzáférés. A te szerepköröd (${req.user.role}) nem jogosult a műveletre.`,
      });
    }

    next();
  };
};

export { authenticateUser, authorizeRoles };