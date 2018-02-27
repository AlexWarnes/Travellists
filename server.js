'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;

const {router: apiRouter} = require('./routes/apiRouter');
const {router: authRouter} = require('./routes/authRouter');
const {localStrategy, jwtStrategy} = require('./auth/strategies')

const { PORT, DATABASE_URL, TEST_DATABASE_URL } = require('./config');

const app = express();
app.use(morgan('common'));
passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(express.static('public'));
app.use('/api', apiRouter);
app.use('/auth', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

let server;

function runServer(databaseURL, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseURL, err => {
			if(err) {
				return reject(err);
			}
			server = app.listen(port, () => {
			console.log(`The Matrix has you on port \x1b[32m${port}\x1b[0m`);
			resolve();	
		})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});	
		});
	});
}

app.get('/lists', (req, res) => {
	res.status(200).sendFile(__dirname + '/public/lists.html');
});

app.get('/about', (req, res) => {
	res.status(200).sendFile(__dirname + '/public/about.html');
});

app.get('/travelers', (req, res) => {
	res.status(200).sendFile(__dirname + '/public/profiles.html');
});

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};