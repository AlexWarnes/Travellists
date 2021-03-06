exports.PORT = process.env.PORT || 8080;

exports.DATABASE_URL = process.env.DATABASE_URL || 
	'mongodb://localhost/travelmate';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
	'mongodb://localhost/testingDB';

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';