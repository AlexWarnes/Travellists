'use strict';

const express = require('express');
const faker = require('faker');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;

const { List, User } = require('../models');

const router = express.Router();
router.use(bodyParser.json());


//==================== GET REQUESTS ====================


// GET LISTS

router.get('/lists', (req, res, next) => {
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

router.get('/lists/:id', (req, res, next) => {
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

router.get('/users', (req, res, next) => {
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

router.get('/users/:id', (req, res, next) => {
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

router.post('/lists', (req, res, next) => {
	const requiredFields = ['city', 'country', 'title', 'description', 'places', 'author', 'dateCreated'];
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
			author: req.body.author,
			dateCreated: req.body.dateCreated
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

router.post('/users', (req, res, next) => {
	const requiredFields = ['userName', 'userDescription', 'dateJoined'];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	User
		.create({
			userName: req.body.userName,
			userDescription: req.body.userDescription,
			countriesVisited: req.body.countriesVisited,
			email: req.body.email,
			dateCreated: req.body.dateCreated
		})
		.then(user => {
			res.status(201)
			.json(user.serialize());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});


//==================== PUT REQUESTS ====================

router.put('/lists/:id', (req, res, next) => {
	if (req.params.id !== req.body.id) {
		const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`;
		console.error(message);
		return res.status(400).json({message: message});
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

router.put('/users/:id', (req, res, next) => {
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

router.delete('/lists/:id', (req, res, next) => {
	List
		.findByIdAndRemove(req.params.id)
		.then(list => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/users/:id', (req, res, next) => {
	User
		.findByIdAndRemove(req.params.id)
		.then(user => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});


//==================== CATCH ANY REQUESTS TO INVALID ENDPOINTS ====================

router.use('*', (req, res, next) => {
	res.status(404).json({message: 'Not Found'});
});

module.exports = router;
