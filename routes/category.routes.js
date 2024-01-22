import express from 'express';

// middleware
import { requireSignin } from '../middlewares/index.js';

// controllers
import {
	create,
	categories,
	removeCategory,
	updateCategory,
	postsByCategory,
	searchCategories,
} from '../controllers/category.controllers.js';

const categoryRouter = express.Router();

categoryRouter.post('/category', requireSignin, create);
categoryRouter.get('/categories', categories);
categoryRouter.delete('/category/:slug', requireSignin, removeCategory);
categoryRouter.put('/category/:slug', requireSignin, updateCategory);
categoryRouter.get('/posts-by-category/:slug', postsByCategory);
categoryRouter.get('/search-category/:query', searchCategories);

export default categoryRouter;
