// routes/loginRoute.js
import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { getLoggedInUser, logoutCurrentUser } from '../controllers/userController.js';

const router = express();



router.get('/get-user',authenticateUser,getLoggedInUser)


router.post('/logout',logoutCurrentUser)

  

  

export default router;
