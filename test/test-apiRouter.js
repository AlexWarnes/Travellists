'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
	const expect = chai.expect;

const mongoose = require('mongoose');
const faker = require('faker');
const jwt = require('jsonwebtoken');

const { List, User } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');


chai.use(chaiHttp);

//========== CREATE TEST DATA AND SEED TEST DATABASE ==========

function generateList() {
	return {
		city: faker.address.city(),
		country: faker.address.country(),
		title: faker.company.catchPhrase(),
		description: faker.lorem.paragraph(),
		places: [
			{
				placeName: 'Cafe ' + faker.lorem.word(),
				placeLocation: [12345, 9876],
				placeDescription: faker.lorem.sentence()
			}, 
			{
				placeName: 'Cafe ' + faker.lorem.word(),
				placeLocation: [12345, 9876],
				placeDescription: faker.lorem.sentence()
			}, 
			{
				placeName: 'Cafe ' + faker.lorem.word(),
				placeLocation: [12345, 9876],
				placeDescription: faker.lorem.sentence()
			}
		],
		author: 'exampleUser',
		authorID: '123456789',
		//consider converting date to mongo date format and 
		//adding comparisons in tests
		dateCreated: faker.date.recent()
	};
};

function seedListData() {
	console.info('Seeding "List" data');
	const seedData = [];

	for (let i = 0; i <= 5; i++) {
		seedData.push(generateList());
	}

	return List.insertMany(seedData);
};

function generateUser() {
	return {
		userName: faker.internet.userName(),
		password: 'examplePass',
		userDescription: `I love ${faker.company.catchPhraseAdjective} travel`,
		email: faker.internet.email(),
		countriesVisited: [faker.address.country(), 'Canada', 'Mexico', 'United States'],
		listsMade: faker.random.number(),
		dateJoined: faker.date.recent()
	};
}

function seedUserData() {
	console.info('Seeding "User" data');
	const seedData = [];

	for (let i = 0; i <= 10; i++) {
		seedData.push(generateUser());
	}

	return User.insertMany(seedData);
};

function getToken(userName) {
	const token = jwt.sign(
    {
    	user: {userName}
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: userName,
      expiresIn: '7d'
    }
  );
	return token;
}


function tearDownDatabase() {
	console.warn('\x1b[31m%s\x1b[0m', 'DELETING DATABASE');
	return mongoose.connection.dropDatabase();
}

//==================== TESTING CRUD on LISTS COLLECTION ====================

describe('API Resource for Lists', function() {
	const userName = 'exampleUser';
	const password = 'examplePass';
	const token = jwt.sign(
		{
			user: {userName}
		},
		JWT_SECRET,
		{
			algorithm: 'HS256',
			subject: userName,
			expiresIn: '1d'
		}
	);

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedListData()
		.then(User.hashPassword(password))
		.then(password => User.create({
			userName,
			password
		})
		);
	});

	afterEach(function() {
		return User.remove({})
		.then(tearDownDatabase());
	});
	
	after(function() {
		return closeServer();
	});


//==================== GET /api/lists TESTING  ====================

	describe('GET endpoint', function() {
		it('should return all the lists', function() {
			
			let res;

			return chai.request(app)
			.get('/api/lists')
			.set('authorization', `Bearer ${token}`)
			.then(function(_res) {
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.noContent).to.be.false;
				expect(res.body).to.have.length.of.at.least(1);
				return List.count();
			})
			.then(function(count) {
				expect(res.body).to.have.lengthOf(count);
			});
		});

		it('should return Lists with the correct fields', function() {
			
			let responseList;
			
			return chai.request(app)
			.get('/api/lists')
			.set('authorization', `Bearer ${token}`)
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');
				expect(res.body).to.have.length.of.at.least(1);

				res.body.forEach(function(entry) {
					expect(entry).to.be.a('object');
					expect(entry).to.include.keys(
						'id', 'city', 'country', 'title', 'description', 
						'places', 'author', 'dateCreated');
				});
				responseList = res.body[0];
				return List.findById(responseList.id);
			})
			.then(function(list) {
				expect(responseList.id).to.equal(list.id);
				expect(responseList.city).to.equal(list.city);
				expect(responseList.country).to.equal(list.country);
				expect(responseList.title).to.equal(list.title);
				expect(responseList.description).to.equal(list.description);
				expect(responseList.places.count).to.equal(list.places.count);
				expect(responseList.author).to.equal(list.author);
			});
		});
	});


//==================== POST /api/lists TESTING  ====================

	describe('POST endpoint', function() {
		it('should add a new List', function() {

			const newList = generateList();

			return chai.request(app)
			.post('/api/lists')
			.set('authorization', `Bearer ${token}`)
			.send(newList)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys(
					'id', 'city', 'country', 'title', 'description', 
					'places', 'author', 'dateCreated');
				expect(res.body.id).to.not.be.null;
				expect(res.body.city).to.equal(newList.city);
				expect(res.body.country).to.equal(newList.country);
				expect(res.body.title).to.equal(newList.title);
				expect(res.body.description).to.equal(newList.description);
				expect(res.body.places.count).to.equal(newList.places.count);
				expect(res.body.author).to.equal(newList.author);

				return List.findById(res.body.id);
			})
			.then(function(list) {
				expect(list.id).not.to.be.null;
				expect(list.city).to.equal(newList.city);
				expect(list.country).to.equal(newList.country);
				expect(list.title).to.equal(newList.title);
				expect(list.description).to.equal(newList.description);
				expect(list.places.count).to.equal(newList.places.count);
				expect(list.author).to.equal(newList.author);
			});
		});
	});


//==================== PUT /api/lists/:id TESTING  ====================

	describe('PUT endpoint', function() {
		it('should update only the fields you send over for the specified list', function() {
			
			const updateData = {
				city: 'Ceres',
				title: 'Frog from Kyoto'
			};

			return List
			.findOne()
			.then(function(list) {
				updateData.id = list.id;

				return chai.request(app)
				.put(`/api/lists/${list.id}`)
				.set('authorization', `Bearer ${token}`)
				.send(updateData);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
				return List.findById(updateData.id);
			})
			.then(function(list) {
				expect(list.city).to.equal(updateData.city);
				expect(list.title).to.equal(updateData.title);
				expect(list.description).to.be.a('string');
			});
		});
	});


//==================== DELETE /api/lists/:id TESTING  ====================

	describe('DELETE endpoint', function() {
		it('should delete the list you specify', function() {

			let list;

			return List
			.findOne()
			.then(function (_list) {
				list = _list;
				return chai.request(app)
				.delete(`/api/lists/${list.id}`)
				.set('authorization', `Bearer ${token}`);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
				return List.findById(list.id);
			})
			.then(function(list) {
				expect(list).to.be.null;
			});
		});
	});
});



//==================== TESTING CRUD on USERS COLLECTION ====================
//==========================================================================



describe('API Resource for Users', function() {

	const userName = 'exampleUser';
	const password = 'examplePass';
	const token = jwt.sign(
		{
			user: {userName}
		},
		JWT_SECRET,
		{
			algorithm: 'HS256',
			subject: userName,
			expiresIn: '1d'
		}
	);

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedUserData()
		.then(User.hashPassword(password))
		.then(password => User.create({
			userName,
			password
		})
		);
	});

	afterEach(function() {
		return User.remove({})
		.then(tearDownDatabase());
	});
	
	after(function() {
		return closeServer();
	});

//==================== GET /api/users TESTING  ====================

	describe('GET endpoint', function() {
		it('should return all the users', function() {
			
			let res;
			
			return chai.request(app)
			.get('/api/users')
			.set('authorization', `Bearer ${token}`)
			.then(function(_res) {
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.noContent).to.be.false;
				expect(res.body).to.have.length.of.at.least(1);
				return User.count();
			})
			.then(function(count) {
				expect(res.body).to.have.lengthOf(count);
			});
		});

		it('should return Users with the correct fields', function() {
			
			let responseUser;
			
			return chai.request(app)
			.get('/api/users')
			.set('authorization', `Bearer ${token}`)
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');
				expect(res.body).to.have.length.of.at.least(1);

				res.body.forEach(function(entry) {
					expect(entry).to.be.a('object');
					expect(entry).to.include.keys(
						'id', 'userName', 'dateJoined');
				});
				responseUser = res.body[0];
				return User.findById(responseUser.id);
			})
			.then(function(user) {
				expect(responseUser.id).to.equal(user.id);
				expect(responseUser.userName).to.equal(user.userName);
				expect(responseUser.userDescription).to.equal(user.userDescription);
				expect(responseUser.dateJoined).not.to.be.null;
			});
		});
	});


//==================== POST /api/users TESTING  ====================

	describe('POST endpoint', function() {
		it('should add a new User', function() {

			const newUser = generateUser();

			return chai.request(app)
			.post('/api/users')
			.set('authorization', `Bearer ${token}`)
			.send(newUser)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys(
					'id', 'userName', 'userDescription', 'dateJoined');
				expect(res.body.id).to.not.be.null;
				expect(res.body.userName).to.equal(newUser.userName);
				expect(res.body.userDescription).to.equal(newUser.userDescription);
				expect(res.body.dateJoined).not.to.be.null;

				return User.findById(res.body.id);
			})
			.then(function(user) {
				expect(user.id).not.to.be.null;
				expect(user.userName).to.equal(newUser.userName);
				expect(user.userDescription).to.equal(newUser.userDescription);
				expect(user.dateJoined).not.to.be.null;
			});
		});
	});


//==================== PUT /api/users/:id TESTING  ====================

	describe('PUT endpoint', function() {
		it('should update only the fields you send over for the specified user', function() {
			
			const updateData = {
				userName: 'KyotoFrog',
				userDescription: 'On the long road to Okinawa.'
			};

			return User
			.findOne()
			.then(function(user) {
				updateData.id = user.id;
				console.log('LOOK HERE' + updateData);
				
				return chai.request(app)
				.put(`/api/users/${user.id}`)
				.set('authorization', `Bearer ${token}`)
				.send(updateData);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
				return User.findById(updateData.id);
			})
			.then(function(user) {
				expect(user.userName).to.equal(updateData.userName);
				expect(user.userDescription).to.equal(updateData.userDescription);
				expect(user.userDescription).to.be.a('string');
			});
		});
	});


//==================== DELETE /api/users/:id TESTING  ====================

	describe('DELETE endpoint', function() {
		it('should delete the user you specify', function() {

			let user;

			return User
			.findOne()
			.then(function (_user) {
				user = _user;
				return chai.request(app)
				.delete(`/api/users/${user.id}`)
				.set('authorization', `Bearer ${token}`);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
				return User.findById(user.id);
			})
			.then(function(user) {
				expect(user).to.be.null;
			});
		});
	});
});


