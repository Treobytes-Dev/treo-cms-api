import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { validationResult } from 'express-validator';
import { hashPassword, comparePassword } from '../helpers/auth.js';
import emailValidator from 'email-validator';
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

export const signup = async (req, res) => {
	const { name, email, password } = req.body;

	// check for errors
	const errors = validationResult(req);

	// if error show the first one as they happen
	if (!errors.isEmpty()) {
		const returnError = errors.array().map((error) => error.msg);
		return res.status(400).json({ errors: returnError });
	}

	// check if the user exists already
	const userExists = await User.findOne({ email });
	if (userExists)
		return res.status(403).json({
			error: ['Email is taken'],
		});

	const hashedPassword = await hashPassword(password);

	const user = new User({
		name,
		email,
		password: hashedPassword,
	});

	try {
		await user.save();
		res.status(200).json({ message: 'Successfully signed up!', success: true });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: 'There was an error. Try Again.' });
	}
};

export const signin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		// check for errors
		const errors = validationResult(req);

		// if error show the first one as they happen
		if (!errors.isEmpty()) {
			const returnError = errors.array().map((error) => error.msg);
			return res.status(400).json({ errors: returnError });
		}

		if (!user) {
			return res.status(401).json({
				error: 'User with that email does not exist. Please signup',
			});
		}

		const match = await comparePassword(password, user.password);

		if (!match) {
			return res.status(401).json({
				error: 'Wrong password',
			});
		}

		// create signed token
		// generate a token with user id and secret
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			// expiresIn: new Date() + 9999,
			expiresIn: '364d',
		});

		user.password = undefined;

		res.json({
			success: true,
			token,
			user,
		});
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: 'Error. Try again.' });
	}
};

export const signout = (req, res) => {
	res.clearCookie('t');
	return res.status(200).json({ message: 'Successfully signed out!' });
};

export const currentUser = async (req, res) => {
	try {
		// const user = await User.findById(req.user._id);
		return res.status(200).json({ ok: true });
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: 'Error getting the current user' });
	}
};

export const createUser = async (req, res) => {
	try {
		const { name, email, password, role, checked, website } = req.body;
		if (!name) {
			return res.json({
				error: 'Name is required',
			});
		}
		if (!email) {
			return res.json({
				error: 'Email is required',
			});
		}
		if (!password || password.length < 6) {
			return res.json({
				error: 'Password is required and should be 6 characters long',
			});
		}
		// if user exist
		const exist = await User.findOne({ email });
		if (exist) {
			return res.json({ error: 'Email is taken' });
		}
		// hash password
		const hashedPassword = await hashPassword(password);

		// TODO: integrate email sending functionality
		// if checked, send email with login details
		// if (checked) {
		//   // prepare email
		//   const emailData = {
		//     to: email,
		//     from: process.env.EMAIL_FROM,
		//     subject: "Account created",
		//     html: `
		//     <h1>Hi ${name}</h1>
		//     <p>Your CMS account has been created successfully.</p>
		//     <h3>Your login details</h3>
		//     <p style="color:red;">Email: ${email}</p>
		//     <p style="color:red;">Password: ${password}</p>
		//     <small>We recommend you to change your password after login.</small>
		//     `,
		//   };

		//   try {
		//     const data = await sgMail.send(emailData);
		//     console.log("email sent => ", data);
		//   } catch (err) {
		//     console.error(err);
		//   }
		// }

		try {
			const user = await new User({
				name,
				email,
				password: hashedPassword,
				role,
				website,
			}).save();

			const { password, ...rest } = user._doc;
			return res.json(rest);
		} catch (err) {
			console.error(err);
		}
	} catch (err) {
		console.error(err);
	}
};

export const users = async (req, res) => {
	try {
		const all = await User.find().select('-password -secret -resetCode');
		res.json(all);
	} catch (err) {
		console.error(err);
	}
};

export const deleteUser = async (req, res) => {
	try {
		const { userId } = req.params;
		if (userId === req.user._id) return;
		const user = await User.findByIdAndDelete(userId);
		res.json(user);
	} catch (err) {
		console.error(err);
	}
};

export const currentUserProfile = async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).populate('image');
		res.json(user);
	} catch (err) {
		console.error(err);
	}
};

export const updateUserByAdmin = async (req, res) => {
	try {
		const { id, name, email, password, website, role, image } = req.body;

		const userFromDb = await User.findById(id);

		// check valid email
		if (!emailValidator.validate(email)) {
			return res.json({ error: 'Invalid email' });
		}
		// check if email is taken
		const exist = await User.findOne({ email });
		if (exist && exist._id.toString() !== userFromDb._id.toString()) {
			return res.json({ error: 'Email is taken' });
		}
		// check password length
		if (password && password.length < 6) {
			return res.json({
				error: 'Password is required and should be 6 characters long',
			});
		}

		const hashedPassword = password ? await hashPassword(password) : undefined;
		const updated = await User.findByIdAndUpdate(
			id,
			{
				name: name || userFromDb.name,
				email: email || userFromDb.email,
				password: hashedPassword || userFromDb.password,
				website: website || userFromDb.website,
				role: role || userFromDb.role,
				image: image || userFromDb.image,
			},
			{ new: true }
		).populate('image');

		res.json(updated);
	} catch (err) {
		console.error(err);
	}
};

export const updateUserByUser = async (req, res) => {
	try {
		const { id, name, email, password, website, role, image } = req.body;

		const userFromDb = await User.findById(id);

		// check if user is himself/herself
		if (userFromDb._id.toString() !== req.user._id.toString()) {
			return res.status(403).send('You are not allowed to update this user');
		}

		// check valid email
		if (!emailValidator.validate(email)) {
			return res.json({ error: 'Invalid email' });
		}
		// check if email is taken
		const exist = await User.findOne({ email });
		if (exist && exist._id.toString() !== userFromDb._id.toString()) {
			return res.json({ error: 'Email is taken' });
		}
		// check password length
		if (password && password.length < 6) {
			return res.json({
				error: 'Password is required and should be 6 characters long',
			});
		}

		const hashedPassword = password ? await hashPassword(password) : undefined;
		const updated = await User.findByIdAndUpdate(
			id,
			{
				name: name || userFromDb.name,
				email: email || userFromDb.email,
				password: hashedPassword || userFromDb.password,
				website: website || userFromDb.website,
				// role is not available as a user because they don't have admin rights
				image: image || userFromDb.image,
			},
			{ new: true }
		).populate('image');

		res.json(updated);
	} catch (err) {
		console.error(err);
	}
};

export const uploadImage = async (req, res) => {
	try {
		const result = await cloudinary.uploader.upload(req.body.image);
		res.status(200).json(result.secure_url);
	} catch (err) {
		console.error(err);
		return res.status(400).json({ error: 'Error uploading image' });
	}
};
