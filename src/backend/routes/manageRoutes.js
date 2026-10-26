import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listAllRestaurants,
  createRestaurant,
  toggleRestaurant,
  deleteRestaurant,
  listUsers,
  deleteUser,
  getMyRestaurant,
  addMenuItem,
  deleteMenuItem,
} from '../controllers/manageController.js';

const router = express.Router();

// super admin
router.get('/restaurants', requireAuth, requireRole('SUPER_ADMIN'), listAllRestaurants);
router.post('/restaurants', requireAuth, requireRole('SUPER_ADMIN'), createRestaurant);
router.patch('/restaurants/:id/toggle', requireAuth, requireRole('SUPER_ADMIN'), toggleRestaurant);
router.delete('/restaurants/:id', requireAuth, requireRole('SUPER_ADMIN'), deleteRestaurant);
router.get('/users', requireAuth, requireRole('SUPER_ADMIN'), listUsers);
router.delete('/users/:id', requireAuth, requireRole('SUPER_ADMIN'), deleteUser);

// restaurant admin
router.get('/mine', requireAuth, requireRole('RESTAURANT_ADMIN'), getMyRestaurant);
router.post('/mine/menu', requireAuth, requireRole('RESTAURANT_ADMIN'), addMenuItem);
router.delete('/mine/menu/:itemId', requireAuth, requireRole('RESTAURANT_ADMIN'), deleteMenuItem);

export default router;