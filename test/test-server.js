'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const {app, runServer, closeServer} = require('../server');

chai.use(chaiHttp);


describe('Serving static public resources', function() {
	
	before(function() {
		return runServer();
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

describe('List and Traveler API Resource', function() {
	
	before(function() {
		return runServer();
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
			});
		});
	});
});