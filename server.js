'use strict';

const express = require('express');
const morgan = require('morgan');
// const bodyParser = require('body-parser');

const {PORT} = require('./config');

const app = express();
app.use(morgan('common'));
app.use(express.static('public'));

let server;

function runServer(port = PORT) {
	server = app.listen(port, () => {
		console.log(`The Matrix has you on port ${port}`);	
	})
		.on('error', err => {
			reject(err);
		});
}

function closeServer() {
	console.log('Closing server');
	server.close(err => {
		if (err) {
			return reject(err);
		}
	});
}

if (require.main === module) {
	runServer();
	// .catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};