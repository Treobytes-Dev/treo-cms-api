import mongoose from 'mongoose';
const { ObjectId } = mongoose;

const postSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		content: { type: {} },
		categories: [{ type: ObjectId, ref: 'Category' }],
		published: { type: Boolean, default: true },
		postedBy: { type: ObjectId, ref: 'User' },
		featuredImage: { type: ObjectId, ref: 'Media' },
		slug: {
			type: String,
			unique: true,
			lowercase: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.model('Post', postSchema);
