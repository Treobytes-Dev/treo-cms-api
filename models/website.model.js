import mongoose from 'mongoose';
const { ObjectId } = mongoose;

const websiteSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		featuredImage: { type: ObjectId, ref: 'Media' },
		content: { type: {} },
		slug: {
			type: String,
			unique: true,
			lowercase: true,
		},
		placeholder: {
			type: Number,
		},
	},
	{ timestamps: true }
);

export default mongoose.model('Website', websiteSchema);
