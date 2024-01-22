import express from 'express';
import formidable from 'express-formidable';

// middleware
import { requireSignin } from '../middlewares/index.js';
// controllers
import {
	uploadImage,
	createPost,
	posts,
	uploadImageFile,
	media,
	removeMedia,
	singlePost,
	removePost,
	editPost,
	postsByAuthor,
	postCount,
	postsAll,
	createComment,
	comments,
	userComments,
	commentCount,
	updateComment,
	removeComment,
	getNumbers,
} from '../controllers/post.controllers.js';

const postRouter = express.Router();

postRouter.post('/upload-image', requireSignin, uploadImage);
postRouter.post(
	'/upload-image-file',
	formidable(),
	requireSignin,
	uploadImageFile
);
postRouter.post('/create-post', requireSignin, createPost);
// postRouter.get("/posts", posts);
postRouter.get('/posts/:page', posts);
postRouter.get('/post/:slug', singlePost);
postRouter.delete('/post/:postId', requireSignin, removePost);
postRouter.put('/edit-post/:postId', requireSignin, editPost);
postRouter.get('/posts-by-author', requireSignin, postsByAuthor);
postRouter.get('/post-count', postCount);
postRouter.get('/posts-all', requireSignin, postsAll);
// media
postRouter.get('/media', requireSignin, media);
postRouter.delete('/media/:id', requireSignin, removeMedia);
// comment
postRouter.post('/comment/:postId', requireSignin, createComment);
postRouter.get('/comments/:page', requireSignin, comments);
postRouter.get('/user-comments', requireSignin, userComments);
postRouter.get('/comment-count', commentCount);
postRouter.put(
	'/comment/:commentId',
	requireSignin,

	updateComment
);
postRouter.delete(
	'/comment/:commentId',
	requireSignin,

	removeComment
);
postRouter.get('/numbers', getNumbers);

export default postRouter;
