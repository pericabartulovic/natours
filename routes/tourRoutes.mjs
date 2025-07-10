import express from 'express';
import tourController from '../controllers/tourController.mjs';
import authController from '../controllers/authController.mjs';
import reviewRouter from './reviewRoutes.mjs';

const router = express.Router();
/*
  for optional paramater we add ? eg. '/api/v1/tours/:id/x?' 
  then on request to '/api/v1/tours/5' /x is ommited - cl would return: { id: 5, x: undefined}
*/
///////////// NESTED ROUTES IN EXPRESS //////
// POST /tour/234sdf2/reviews
// GET /tour/234sdf2/reviews

router.use('/:tourId/reviews', reviewRouter); // whenever is this route pattern met it will be assigned to reviewRouter
//////////////// END //////////////////////////

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// /tours-within/233/center/-40,45/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi  //user should specify options using query strings

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

export default router;
