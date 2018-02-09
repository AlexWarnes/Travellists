'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const faker = require('faker');

const { List, User } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

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
		author: 'req.user',
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

function generateUsers() {

}

function seedUserData() {

}

function tearDownDatabase() {
	console.warn('\x1b[31m%s\x1b[0m', 'DELETING DATABASE');
	return mongoose.connection.dropDatabase();
}


//==================== TESTING AREA ===============================


// TESTING STATIC PUBLIC ASSETS

describe('Serving static public resources', function() {
	
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});
	
	after(function() {
		return closeServer();
	});

	describe('HTML loads', function() {
		it('link to home (/) should serve HTML', function() {
			let res;
			return chai.request(app)
			.get('/')
			.then(function(_res) {
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});

		it('link to (/about) should serve HTML', function() {
			let res;
			return chai.request(app)
			.get('/about')
			.then(function(_res) {
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});
	});
});


// TESTING LIST API ENDPOINTS AND METHODS

describe('API Resource for Lists', function() {
	
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedListData();
	});

	afterEach(function() {
		return tearDownDatabase();
	});
	
	after(function() {
		return closeServer();
	});

	describe('GET endpoint', function() {
		it('should return all the lists', function() {
			
			let res;
			
			return chai.request(app)
			.get('/api/lists')
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

	describe('POST endpoint', function() {
		it('should add a new List', function() {

			const newList = generateList();

			return chai.request(app)
			.post('/api/lists')
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

	describe('DELETE endpoint', function() {
		it('should delete the list you specify', function() {

			let list;

			return List
			.findOne()
			.then(function (_list) {
				list = _list;
				return chai.request(app)
				.delete(`/api/lists/${list.id}`);
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












