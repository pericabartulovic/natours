import express from "express";
import userController from "../controllers/userController.mjs";
import authController from "../controllers/authController.mjs";

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/myBookings', userController.getMyTours);
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

// Admin creates a user with any role
router.post('/adminCreateUser', userController.createUser);

router
  .route('/')
  .get(userController.getAllUsers);
// .post(userController.createUser);   // for this we have auth controller and sign up logic

router
  .route('/guides')
  .get(userController.getGuides)


router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


export default router;