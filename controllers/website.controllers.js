import Website from '../models/website.model.js';
import sgMail from '@sendgrid/mail';
import slugify from 'slugify';

// const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);
// DOCS:
// https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs
// https://blog.logrocket.com/how-to-send-emails-with-node-js-using-sendgrid/
export const contact = async (req, res) => {
	try {
		const { name, email, message } = req.body;
		// prepare email
		const emailData = {
			from: process.env.EMAIL_FROM,
			to: process.env.EMAIL_FROM,
			subject: 'Email received from contact form',
			html: `
      <h3>Contact form message</h3>
      <p><u>Name</u></p>
      <p>${name}</p>
    <p><u>Email</u></p>
    <p>${email}</p>
    <p><u>Message</u></p>
    <p>${message}</p>
      `,
		};
		// send email
		try {
			const data = await sgMail.send(emailData);
			res.json({ ok: true });
		} catch (err) {
			console.error(err);
			res.json({ ok: false });
		}
	} catch (err) {
		console.error(err);
		res.json({ error: `Error with the contact controller: ${err}` });
	}
};

export const getPage = async (req, res) => {
	try {
		const { slug } = req.params;
		const found = await Website.findOne({ slug })
			.populate('name slug')
			.populate('featuredImage', 'url');

		console.log('getPage controller => ', found);

		res.status(200).json(found);
	} catch (err) {
		console.error(err);
		res.json({ error: `Error with the getPage controller: ${err}` });
	}
};

// homepage, getHomepage
export const createPage = async (req, res) => {
	try {
		const { name } = req.body;
		// check if title is taken
		const alreadyExist = await Website.findOne({
			slug: slugify(name.toLowerCase()),
		});
		if (alreadyExist) return res.json({ error: 'This page name is taken' });

		// save post
		setTimeout(async () => {
			try {
				const newPage = await new Website({
					...req.body,
					slug: slugify(name),
				}).save();
				return res.status(200).json(newPage);
			} catch (err) {
				console.error(err);
			}
		}, 1000);
	} catch (err) {
		console.error(err);
		res.json({ error: `Error with the createPage controller: ${err}` });
	}
};

export const updatePage = async (req, res) => {
	try {
		const { pageId } = req.params;
		const { name, title, content, featuredImage } = req.body;

		setTimeout(async () => {
			const update = await Website.findByIdAndUpdate(
				pageId,
				{
					name,
					title,
					slug: slugify(name),
					content,
					featuredImage,
					placeholder,
				},
				{ new: true }
			)
				.populate('title slug placeholder')
				.populate('featuredImage', 'url');

			res.status(200).json(update);
		}, 1000);
	} catch (err) {
		console.error(err);
		res.json({ error: `Error with the createPage controller: ${err}` });
	}
};

export const pagesAll = async (req, res) => {
	try {
		const pages = await Website.find().select('title page slug placeholder');
		res.status(200).json(pages);
	} catch (err) {
		console.error(`Error finding all pages: ${err}`);
		return res.status(400).json({ error: 'Error finding all pages' });
	}
};

// todo: delete page
export const removePage = async (req, res) => {
	try {
		await Website.findByIdAndDelete(req.params.pageId);
		res.json({ ok: true });
	} catch (err) {
		console.error(`Error deleting page: ${err}`);
		return res.status(400).json({ error: 'Error deleting page' });
	}
};
