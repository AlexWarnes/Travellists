'use strict';

const chaiHttp = require('chai-http');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');

const { List, User } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

//==================== TESTING STATIC PUBLIC ASSETS ====================

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

		it('link to (/lists) should serve HTML', function() {
			let res;
			return chai.request(app)
			.get('/lists')
			.then(function(_res) {
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});

		it('link to (/travelers) should serve HTML', function() {
			let res;
			return chai.request(app)
			.get('/travelers')
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




