'use strict';

const express = require('express'); 
const morgan = require('morgan');
const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;

const apiRouter = require('./routes/apiRouter');

const { PORT, DATABASE_URL, TEST_DATABASE_URL } = require('./config');

const app = express();
app.use(morgan('common'));
app.use(express.static('public'));
app.use('/api', apiRouter);

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

app.get('/about', (req, res) => {
	console.log(__dirname);
	res.status(200).sendFile(__dirname + '/public/about.html');
});

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};