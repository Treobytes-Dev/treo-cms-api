import Category from '../models/category.model.js';
import Post from '../models/post.model.js';
import slugify from 'slugify';

export const create = async (req, res) => {
	try {
		const { name } = req.body;
		const category = await new Category({
			name,
			slug: slugify(name),
		}).save();

		res.status(200).json(category);
	} catch (error) {
		console.error(err);
		res.status(400).json({ error: 'Error creating category' });
	}
};

export const categories = async (req, res) => {
	try {
		const categories = await Category.find().sort({ createdAt: -1 });

		res.status(200).json(categories);
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: 'Error finding categories' });
	}
};

export const removeCategory = async (req, res) => {
	try {
		const { slug } = req.params;
		const category = await Category.findOneAndDelete({ slug });

		res.status(200).json(category);
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: 'Error removing category' });
	}
};

export const updateCategory = async (req, res) => {
	try {
		const { slug } = req.params;
		const { name } = req.body;
		const category = await Category.findOneAndUpdate(
			{ slug },
			{ name, slug: slugify(name) },
			{ new: true }
		);

		res.status(200).json(category);
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: 'Error updating category' });
	}
};

export const postsByCategory = async (req, res) => {
	try {
		const { slug } = req.params;
		const category = await Category.findOne({ slug });

		const posts = await Post.find({ categories: category._id })
			.populate('featuredImage postedBy')
			.limit(20);

		res.status(200).json({ posts, category });
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: 'Error posts by category category' });
	}
};

export const searchCategories = async (req, res) => {
	const { query } = req.params;

	if (!query) return;

	try {
		// $regex is special method from mongodb
		// The i modifier is used to perform case-insensitive matching
		const category = await Category.find({
			// $or is used to search for multiple fields
			$or: [
				{ name: { $regex: query, $options: 'i' } },
				{ slug: { $regex: query, $options: 'i' } },
			],
		});
		res.json(category);
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: 'Error searching for categories' });
	}
};
