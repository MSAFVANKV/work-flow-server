// routes/loginRoute.js
import express from 'express';
import { loginUser, verifyOTP } from '../controllers/loginController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { getLoggedInUser } from '../controllers/userController.js';

const router = express();

// Define the POST route for /login
router.post('/login-user', (req, res, next) => {
    console.log('Login route hit');
    next();
  }, loginUser);

  router.post('/verify-otp', (req, res, next) => {
    console.log('Login route hit');
    next();
  }, verifyOTP);


  router.get('get-user',authenticateUser,getLoggedInUser)
  

  

export default router;
