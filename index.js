import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import ServerApiVersion from 'mongodb';
import cors from 'cors';

import authRouter from './routes/auth.routes.js';
import postRouter from './routes/post.routes.js';
import categoryRouter from './routes/category.routes.js';
import websiteRouter from './routes/website.routes.js';

// Create the Express app.
const app = express();

//mongoDB connection
mongoose
	.connect(process.env.MONGO_URI, {
		serverApi: ServerApiVersion.v1,
	})
	.then(() => console.log(chalk.green('MongoDB Connected...')))
	.catch((err) => console.error(chalk.red(err)));

app.use(express.json({ limit: '5mb' }));

// parse requests of content-type - application/json
app.use(express.json());

if ((process.env.NODE_ENV = 'development')) {
	app.use(cors({ origin: 'http://localhost:3000' }));
}

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Setup morgan which gives HTTP request logging.
app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/api', (req, res) => {
	res.json({
		message: 'Social API Server',
	});
});

// Add routes.
// Routes defined in the router will only be considered
// if the request route starts with the /api path.

app.use('/api', authRouter);
app.use('/api', postRouter);
app.use('/api', categoryRouter);
app.use('/api', websiteRouter);

// Middleware for unauthorized users
app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({ error: 'Unauthorized' });
	}
});

// Setup a global error handler.
app.use((err, req, res, next) => {
	console.error(`Global error handler: ${JSON.stringify(err.stack)}`);

	res.status(500).json({
		message: err.message,
		error: process.env.NODE_ENV === 'production' ? {} : err,
	});
});

// Set up for Express app
app.set('port', process.env.PORT || 5000);
const server = app.listen(app.get('port'), () => {
	console.log(
		chalk.whiteBright(`Server is listening on port ${server.address().port}`)
	);
});
