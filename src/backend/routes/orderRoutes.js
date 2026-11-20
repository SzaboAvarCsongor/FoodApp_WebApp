import express from 'express';
import {
  createOrder,
  getUserOrders,
  getMyOrders,
  getRestaurantOrders,
  getCourierOrders,
  updateOrderStatus,
  updateCourierOrderStatus,
} from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('CUSTOMER'), createOrder);
router.get('/', requireAuth, requireRole('CUSTOMER'), getMyOrders);
router.get('/user/:userId', requireAuth, getUserOrders);

// restaurant admin
router.get('/restaurant', requireAuth, requireRole('RESTAURANT_ADMIN'), getRestaurantOrders);
router.patch('/:id/status', requireAuth, requireRole('RESTAURANT_ADMIN'), updateOrderStatus);

// courier
router.get('/courier', requireAuth, requireRole('COURIER'), getCourierOrders);
router.patch('/:id/courier-status', requireAuth, requireRole('COURIER'), updateCourierOrderStatus);

export default router;