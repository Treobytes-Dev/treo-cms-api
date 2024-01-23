import express from 'express';

// middleware
import { requireSignin } from '../middlewares/index.js';

// controllers
import {
	signup,
	signin,
	signout,
	currentUser,
	createUser,
	users,
	deleteUser,
	currentUserProfile,
	updateUserByAdmin,
	updateUserByUser,
} from '../controllers/auth.controllers.js';
import { check } from 'express-validator';

const authRouter = express.Router();

authRouter.post(
	'/signup',
	[
		// name
		check('name', 'Name is required').notEmpty(),
		check('name', 'Name must be between 4 to 150 characters').isLength({
			min: 4,
			max: 150,
		}),

		// email
		check('email', 'Email is required').notEmpty(),
		check('email', 'Email must be between 3 to 32 characters')
			.matches(/.+\@.+\..+/)
			.withMessage('Email must contain @')
			.isLength({
				min: 3,
				max: 32,
			}),

		// password
		check('password', 'Password is required').notEmpty(),
		check('password', 'Body must be between 4 to 2000 characters')
			.isLength({
				min: 6,
			})
			.withMessage('Password must contain at least 6 characters')
			.matches(/\d/)
			.withMessage('Password must contain a number'),
	],
	signup
);

authRouter.post(
	'/signin',
	[
		// email
		check('email', 'Email is required').notEmpty(),
		check('email', 'Email must be between 3 to 32 characters')
			.matches(/.+\@.+\..+/)
			.withMessage('Email must contain @')
			.isLength({
				min: 3,
				max: 32,
			}),

		// password
		check('password', 'Password is required').notEmpty(),
		check('password', 'Body must be between 4 to 2000 characters')
			.isLength({
				min: 6,
			})
			.withMessage('Password must contain at least 6 characters')
			.matches(/\d/)
			.withMessage('Password must contain a number'),
	],
	signin
);

authRouter.get('/signout', signout);
authRouter.get('/current-user', requireSignin, currentUser);
authRouter.get('/current-admin', requireSignin, currentUser);
authRouter.get('/current-author', requireSignin, currentUser);
authRouter.get('/current-subscriber', requireSignin, currentUser);
authRouter.post('/create-user', requireSignin, createUser);
authRouter.get('/users', requireSignin, users);
authRouter.delete('/user/:userId', requireSignin, deleteUser);
authRouter.get('/user/:userId', requireSignin, currentUserProfile);
authRouter.put('/update-user-by-admin', requireSignin, updateUserByAdmin);
authRouter.put('/update-user-by-user', requireSignin, updateUserByUser);

export default authRouter;
