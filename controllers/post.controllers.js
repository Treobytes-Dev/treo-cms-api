import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import Category from '../models/category.model.js';
import Media from '../models/media.model.js';
import Comment from '../models/comment.model.js';
import slugify from 'slugify';
// import {
// 	cloudinaryName,
// 	cloudinaryKey,
// 	cloudinarySecret,
// } from '../helpers/cloudinary.config.js';
import cloudinary from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
});

export const uploadImage = async (req, res) => {
	try {
		const result = await cloudinary.uploader.upload(req.body.image);

		res.status(200).json(result.secure_url);
	} catch (err) {
		console.error(`Error uploading image: ${err}`);
		return res.status(400).json({ error: 'Error uploading image' });
	}
};

export const createPost = async (req, res) => {
	try {
		const { title, content, categories } = req.body;
		// check if title is taken
		const alreadyExist = await Post.findOne({
			slug: slugify(title.toLowerCase()),
		});
		if (alreadyExist) return res.json({ error: 'Title is taken' });

		// get category ids based on category name
		let ids = [];
		for (let i = 0; i < categories.length; i++) {
			Category.findOne({
				name: categories[i],
			})
				.exec()
				.then((data) => {
					ids.push(data._id);
				})
				.catch((err) => console.error(err));
		}

		// save post
		setTimeout(async () => {
			try {
				const post = await new Post({
					...req.body,
					slug: slugify(title),
					categories: ids,
					postedBy: req.user._id,
				}).save();

				// push the post _id to user's posts []
				await User.findByIdAndUpdate(req.user._id, {
					$addToSet: { posts: post._id },
				});

				return res.status(200).json(post);
			} catch (err) {
				console.error(err);
			}
		}, 1000);
	} catch (err) {
		console.error(`Error creating post: ${err}`);
		return res.status(400).json({ error: 'Error creating post' });
	}
};

// export const posts = async (req, res) => {
//   try {
//     const all = await Post.find()
//       .populate("featuredImage")
//       .populate("postedBy", "name")
//       .populate("categories", "name slug")
//       .sort({ createdAt: -1 });
//     res.json(all);
//   } catch (err) {
//     console.error(err);
//   }
// };

export const posts = async (req, res) => {
	try {
		const perPage = 6;
		const page = req.params.page || 1;

		const all = await Post.find()
			.skip((page - 1) * perPage)
			.populate('featuredImage')
			.populate('postedBy', 'name')
			.populate('categories', 'name slug')
			.sort({ createdAt: -1 })
			.limit(perPage);
		res.status(200).json(all);
	} catch (err) {
		console.error(`Error finding posts: ${err}`);
		return res.status(400).json({ error: 'Error finding posts' });
	}
};

export const uploadImageFile = async (req, res) => {
	try {
		const result = await cloudinary.uploader.upload(req.files.file.path);
		// save to db
		const media = await new Media({
			url: result.secure_url,
			public_id: result.public_id,
			postedBy: req.user._id,
		}).save();
		res.status(200).json(media);
	} catch (err) {
		console.error(`Error uploading image file: ${err}`);
		return res.status(400).json({ error: 'Error uploading image file' });
	}
};

export const media = async (req, res) => {
	try {
		const media = await Media.find()
			.populate('postedBy', '_id')
			.sort({ createdAt: -1 });
		res.status(200).json(media);
	} catch (err) {
		console.error(`Error finding media: ${err}`);
		return res.status(400).json({ error: 'Error finding media' });
	}
};

export const removeMedia = async (req, res) => {
	try {
		await Media.findByIdAndDelete(req.params.id);
		res.json({ ok: true });
	} catch (err) {
		console.error(`Error removing media: ${err}`);
		return res.status(400).json({ error: 'Error removing media' });
	}
};

export const singlePost = async (req, res) => {
	try {
		const { slug } = req.params;
		const post = await Post.findOne({ slug })
			.populate('postedBy', 'name')
			.populate('categories', 'name slug')
			.populate('featuredImage', 'url');
		// comments
		const comments = await Comment.find({ postId: post._id })
			.populate('postedBy', 'name')
			.sort({ createdAt: -1 });

		console.log('__comments__', comments);

		res.status(200).json({ post, comments });
	} catch (err) {
		console.error(`Error finding single post: ${err}`);
		return res.status(400).json({ error: 'Error finding single post' });
	}
};

export const removePost = async (req, res) => {
	try {
		const post = await Post.findByIdAndDelete(req.params.postId);
		res.json({ ok: true });
	} catch (err) {
		console.error(`Error removing post: ${err}`);
		return res.status(400).json({ error: 'Error removing post' });
	}
};

export const editPost = async (req, res) => {
	try {
		const { postId } = req.params;
		const { title, content, featuredImage, categories } = req.body;
		// get category ids based on category name
		let ids = [];
		for (let i = 0; i < categories.length; i++) {
			Category.findOne({
				name: categories[i],
			})
				.exec()
				.then((data) => {
					ids.push(data._id);
				})
				.catch((err) => console.error(err));
		}

		setTimeout(async () => {
			const post = await Post.findByIdAndUpdate(
				postId,
				{
					title,
					slug: slugify(title),
					content,
					categories: ids,
					featuredImage,
				},
				{ new: true }
			)
				.populate('postedBy', 'name')
				.populate('categories', 'name slug')
				.populate('featuredImage', 'url');

			res.status(200).json(post);
		}, 1000);
	} catch (err) {
		console.error(`Error editing post: ${err}`);
		return res.status(400).json({ error: 'Error editing post' });
	}
};

export const postsByAuthor = async (req, res) => {
	try {
		const posts = await Post.find({ postedBy: req.user._id })
			.populate('postedBy', 'name')
			.populate('categories', 'name slug')
			.populate('featuredImage', 'url')
			.sort({ createdAt: -1 });
		res.status(200).json(posts);
	} catch (err) {
		console.error(`Error finding posts by author: ${err}`);
		return res.status(400).json({ error: 'Error finding posts by author' });
	}
};

export const postCount = async (req, res) => {
	try {
		const count = await Post.countDocuments();
		res.status(200).json(count);
	} catch (err) {
		console.error(`Error counting posts: ${err}`);
		return res.status(400).json({ error: 'Error counting posts' });
	}
};

export const postsAll = async (req, res) => {
	try {
		const posts = await Post.find().select('title slug');
		res.status(200).json(posts);
	} catch (err) {
		console.error(`Error finding all posts: ${err}`);
		return res.status(400).json({ error: 'Error finding all posts' });
	}
};

export const createComment = async (req, res) => {
	try {
		const { postId } = req.params;
		const { comment } = req.body;
		let newComment = await new Comment({
			content: comment,
			postedBy: req.user._id,
			postId,
		}).save();
		newComment = await newComment.populate('postedBy', 'name');
		res.status(200).json(newComment);
	} catch (err) {
		console.error(`Error creating a comment: ${err}`);
		return res.status(400).json({ error: 'Error creating a comment' });
	}
};

export const comments = async (req, res) => {
	try {
		const perPage = 6;
		const page = req.params.page || 1;

		const allComments = await Comment.find()
			.skip((page - 1) * perPage)
			.populate('postedBy', 'name')
			.populate('postId', 'title slug')
			.sort({ createdAt: -1 })
			.limit(perPage);

		return res.status(200).json(allComments);
	} catch (err) {
		console.error(`Error getting comments: ${err}`);
		return res.status(400).json({ error: 'Error getting comments' });
	}
};

export const userComments = async (req, res) => {
	try {
		const comments = await Comment.find({ postedBy: req.user._id })
			.populate('postedBy', 'name')
			.populate('postId', 'title slug')
			.sort({ createdAt: -1 });

		return res.status(200).json(comments);
	} catch (err) {
		console.error(`Error getting the user's comments: ${err}`);
		return res.status(400).json({ error: "Error getting the user's comments" });
	}
};

export const commentCount = async (req, res) => {
	try {
		const count = await Comment.countDocuments();
		res.status(200).json(count);
	} catch (err) {
		console.error(`Error getting the comment count: ${err}`);
		return res.status(400).json({ error: 'Error getting the comment count' });
	}
};

export const updateComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const { content } = req.body;

		const updatedComment = await Comment.findByIdAndUpdate(
			commentId,
			{ content },
			{ new: true }
		);
		res.status(200).json(updatedComment);
	} catch (err) {
		console.error(`Error updating comment: ${err}`);
		return res.status(400).json({ error: 'Error updating comment' });
	}
};

export const removeComment = async (req, res) => {
	try {
		await Comment.findByIdAndDelete(req.params.commentId);
		res.json({ ok: true });
	} catch (err) {
		console.error(`Error removing comment: ${err}`);
		return res.status(400).json({ error: 'Error removing comment' });
	}
};

export const getNumbers = async (req, res) => {
	try {
		const posts = await Post.countDocuments();
		const users = await User.countDocuments();
		const comments = await Comment.countDocuments();
		const categories = await Category.countDocuments();

		return res.status(200).json({ posts, users, comments, categories });
	} catch (err) {
		console.error(`Error getting numbers: ${err}`);
		return res.status(400).json({ error: 'Error getting numbers' });
	}
};
