import express from 'express';

// middlewares
import { requireSignin } from '../middlewares/index.js';
// controller
import {
	createPage,
	getPage,
	updatePage,
	pagesAll,
	removePage,
} from '../controllers/website.controllers.js';

const websiteRouter = express.Router();

websiteRouter.post('/create-page', requireSignin, createPage);
websiteRouter.post('/edit-page/:pageId', requireSignin, updatePage);
websiteRouter.get('/page/:slug', getPage);
websiteRouter.get('/pages-all', requireSignin, pagesAll);
websiteRouter.delete('/page/:pageId', requireSignin, removePage);

export default websiteRouter;
