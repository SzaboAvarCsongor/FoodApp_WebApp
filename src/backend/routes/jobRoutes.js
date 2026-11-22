import express from 'express';
import {
  getJobs,
  getAppliedJobIds,
  getMyJobs,
  createJob,
  deleteJob,
  applyToJob,
} from '../controllers/jobController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/applied', requireAuth, requireRole('CUSTOMER'), getAppliedJobIds);
router.get('/mine', requireAuth, requireRole('RESTAURANT_ADMIN'), getMyJobs);
router.post('/', requireAuth, requireRole('RESTAURANT_ADMIN'), createJob);
router.delete('/:id', requireAuth, requireRole('RESTAURANT_ADMIN'), deleteJob);
router.post('/:id/apply', requireAuth, requireRole('CUSTOMER'), applyToJob);

export default router;