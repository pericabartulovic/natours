import express from 'express';
import tourController from '../controllers/tourController.mjs';
import authController from '../controllers/authController.mjs';

const router = express.Router();

/**
 * Route parameter middleware for validating the `id` parameter.
 *
 * This middleware runs automatically for any route that includes `:id`
 * and ensures that the provided `id` is valid before continuing to the
 * corresponding route handler.
 *
 * Benefits:
 * - Centralizes parameter validation logic for cleaner controller functions.
 * - Prevents route handler execution if the `id` is invalid (e.g., not found).
 * - Improves maintainability by separating concerns.
 *
 * @param {string} param - The route parameter name (e.g., 'id').
 * @param {Function} middleware - The handler function to execute (e.g., checkId).
 */
// router.param('id', tourController.checkId);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.
  route('/tour-stats')
  .get(tourController.getTourStats);

router.
  route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)                     // .protect -> protecting tour routes
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)

export default router;
