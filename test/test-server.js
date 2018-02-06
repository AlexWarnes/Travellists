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

	describe('app start', function() {
		it('should serve HTML on page load', function() {
			let res;
			return chai.request(app)
			.get('/')
			.then(function(_res) {
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.html;
			});
		});
	});
});