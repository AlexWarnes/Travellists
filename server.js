'use strict';

const express = require('express');
const morgan = require('morgan');
const listRouter = require('./Routes/listRouter');
const travelerRouter = require('./Routes/travelerRouter');
const apiRouter = require('./Routes/apiRouter');

const {PORT} = require('./config');

const app = express();
app.use(morgan('common'));
app.use(express.static('public'));
app.use('/lists', listRouter);
app.use('/travelers', travelerRouter);
app.use('/api', apiRouter);

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

app.get('/about', (req, res) => {
	console.log(__dirname);
	res.status(200).sendFile(__dirname + '/public/about.html');
});

if (require.main === module) {
	runServer();
	// .catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};