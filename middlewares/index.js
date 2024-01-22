import jwt from 'jsonwebtoken';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';

export const requireSignin = (req, res, next) => {
	// receive request with a token to grant the permission
	// The token is being sent by request header, and is extracting the token here from the authorization header and am using split function because the token remains in the form of “Bearer Token” and only want to extract the token that’s why providing the 1 index.
	// The verify method accepts the token and jwt key and provides the decode of the token. After this, are able to get the information of the user.

	const token = req.headers.authorization.split(' ')[1];
	//Authorization: 'Bearer TOKEN'

	jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
		if (err) {
			return res.status(401).json({ error: 'You must be logged in' });
		}

		const { _id } = payload;

		User.findById(_id).then((userdata) => {
			req.user = userdata;
			next();
		});
	});
};
