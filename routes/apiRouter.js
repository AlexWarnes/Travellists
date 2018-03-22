'use strict';

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;

const { List, User } = require('../models');
const {localStrategy, jwtStrategy} = require('../auth/strategies')

const router = express.Router();
const jsonParser = bodyParser.json();

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });
//consider using failureRedirect: '/' key: value above


//==================== GET REQUESTS ====================


// GET LISTS

router.get('/lists', jwtAuth, (req, res, next) => {
	List
		.find()
		.sort({dateCreated: -1})
		.then(data => {
			res.status(200)
			.json(data.map((list) => list.serialize()));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

router.get('/lists/:id', jwtAuth, (req, res, next) => {
	List
		.findById(req.params.id)
		.then(list => {
			res.status(200)
			.json(list.serialize());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});


// GET USERS

router.get('/users', jwtAuth, (req, res, next) => {
	User
		.find()
		.then(data => {
			res.status(200)
			.json(data.map((user) => user.serialize()));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

router.get('/users/:id', jwtAuth, (req, res, next) => {
	User
		.findById(req.params.id)
		.then(user => {
			res.status(200)
			.json(user.serialize());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});


//==================== POST REQUESTS ====================

router.post('/lists', jsonParser, jwtAuth, (req, res, next) => {
	const requiredFields = ['city', 'country', 'title', 'description', 'places'];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	List
		.create({
			city: req.body.city,
			country: req.body.country,
			title: req.body.title,
			description: req.body.description,
			places: req.body.places,
			author: req.user.userName,
			authorID: req.user.id
		})
		.then(list => {
			res.status(201)
			.json(list.serialize());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

router.post('/users', jsonParser, (req, res, next) => {
	const requiredFields = ['userName', 'password', 'userDescription'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
	}

	const stringFields = ['username', 'password', 'userDescription'];
	const nonStringField = stringFields.find(
		field => field in req.body && typeof req.body[field] !== 'string'
	);

	if (nonStringField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Incorrect field type: expected string',
			location: nonStringField
		});
	}

	const explicityTrimmedFields = ['userName', 'password'];
	const nonTrimmedField = explicityTrimmedFields.find(
		field => req.body[field].trim() !== req.body[field]
	);

	if (nonTrimmedField) {
		return res.status(422).json({
		code: 422,
		reason: 'ValidationError',
		message: 'Cannot start or end with whitespace',
		location: nonTrimmedField
		});
	}

	const sizedFields = {
		userName: {
			min: 1
		},
		password: {
			min: 10,
			// bcrypt truncates after 72 characters, so don't give the illusion
			// of security by storing extra (unused) info
			max: 72
		}
	};
	
	const tooSmallField = Object.keys(sizedFields).find(
	field =>
		'min' in sizedFields[field] &&
		req.body[field].trim().length < sizedFields[field].min
	);
	
	const tooLargeField = Object.keys(sizedFields).find(
	field =>
		'max' in sizedFields[field] &&
			req.body[field].trim().length > sizedFields[field].max
	);

	if (tooSmallField || tooLargeField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: tooSmallField
				? `Must be at least ${sizedFields[tooSmallField]
					.min} characters long`
				: `Must be at most ${sizedFields[tooLargeField]
					.max} characters long`,
			location: tooSmallField || tooLargeField
		});
	}

	let {userName, password} = req.body;
	return User.find({userName})
		.count()
		.then(count => {
			if (count > 0) {
				// There is an existing user with the same username
				return Promise.reject({
					code: 422,
					reason: 'ValidationError',
					message: 'Username already taken',
					location: 'userName'
				});
      		}
	
			// If there is no existing user, hash the password
			return User.hashPassword(password);
		})
	    .then(hash => {
			return User
				.create({
					userName: userName,
					password: hash,
					userDescription: req.body.userDescription,
					countriesVisited: req.body.countriesVisited,
					email: req.body.email,
				})
				.then(user => {
					res.status(201)
					.json(user.serialize());
				})
				.catch(err => {
					if (err.reason === 'ValidationError') {
						return res.status(err.code).json(err);
					}
					console.error(err);
					res.status(500).json({message: 'Internal server error'});
				});
			});
});


//==================== PUT REQUESTS ====================

router.put('/lists/:id', jsonParser, jwtAuth, (req, res, next) => {
	if (req.params.id !== req.body.id) {
		const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`;
		console.error(message);
		return res.status(400).json({message: message});
	// } else if (req.user.userName !== req.params.author) {
	// 	const message = 'You cannot edit another traveler\'s list!';
	// 	console.error(message);
	// 	return res.status(400).json({message: message});
	}

	const toUpdate = {};
	const updateableFields = ['city', 'country', 'title', 'description', 'places']

	updateableFields.forEach(field => {
		if (field in req.body) {	
			toUpdate[field] = req.body[field];
		}
	});

	List
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(list => {
			res.status(204).end()
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

router.put('/users/:id', jsonParser, jwtAuth, (req, res, next) => {
	if (req.params.id !== req.body.id) {
		const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`;
		console.error(message);
		return res.status(400).json({message: message});
	}

	const toUpdate = {};
	const updateableFields = ['userName', 'userDescription', 'countriesVisited', 'email']

	updateableFields.forEach(field => {
		if (field in req.body) {	
			toUpdate[field] = req.body[field];
		}
	});

	//Prevent duplicate userNames when updating profile
	//BUG: This successfully prevents duplicate userNames, but
	//the error on the client is in the catch with status 500
	// if (toUpdate.userName) {
	// 	if (User.find(toUpdate.userName).count() > 0) {
	// 	// There is an existing user with the same username
	// 		console.error('Username already taken');
	// 		res.status(422).json({
	// 			code: 422,
	// 			reason: 'ValidationError',
	// 			message: 'Username already taken',
	// 			location: 'userName'
	// 		});
	// 	}
 //    }

	User
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(user => {
			res.status(204).end()
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});  
});


//==================== DELETE REQUESTS ====================

router.delete('/lists/:id', jwtAuth, (req, res, next) => {
	List
	//BUG: This successfully prevents users from deleting other user 
	//lists, but even when it blocks a delete the server still sends a 204 response.
		.findOneAndRemove({
			_id: req.params.id, 
			authorID: req.user.id
		})
		.then(list => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/users/:id', jwtAuth, (req, res, next) => {
	User
		.findByIdAndRemove(req.params.id)
		.then(user => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});


//==================== CATCH ANY REQUESTS TO INVALID ENDPOINTS ====================

router.use('*', (req, res, next) => {
	res.status(404).json({message: 'Not Found'});
});

module.exports = {router};