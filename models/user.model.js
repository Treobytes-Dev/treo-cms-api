import mongoose from 'mongoose';
const { ObjectId } = mongoose;

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			min: 6,
			max: 64,
		},
		role: {
			type: String,
			default: 'subscriber',
		},
		image: { type: ObjectId, ref: 'Media' },
		website: {
			type: String,
		},
		resetCode: { type: String },
		posts: [{ type: ObjectId, ref: 'Post' }],
	},
	{ timestamps: true }
);

export default mongoose.model('User', userSchema);
