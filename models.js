'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;


//==================== LIST SCHEMA ====================

const listSchema = mongoose.Schema({
	city: {type: String, required: true},
	country: {type: String, required: true},
	title: {type: String, required: true},
	description: {type: String, required: true},
	places: [
		{
			placeName: {type: String, required: true},
			placeLocation: {type: Array, required: false},
			placeDescription: {type: String, required: false}
		}
	],
	//need this to default to user as author, maybe
	//with Passport MW and req.user
	author: {type: String, required: true},
	dateCreated: {type: Date, default: Date.now}
});

listSchema.methods.serialize = function() {
	return {
		id: this._id,
		city: this.city,
		country: this.country,
		title: this.title,
		description: this.description,
		places: this.places,
		author: this.author,
		dateCreated: this.dateCreated
	};
};

const List = mongoose.model('List', listSchema);


//==================== USER SCHEMA ===================

const userSchema = mongoose.Schema({
	userName: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	userDescription: {type: String, required: true},
	email: {type: String, required: false},
	countriesVisited: {type: Array, required: false},
	//have lists with userIDs instead of users with a big array
	//of full lists. I think we can get "listsMade" number using
	//a db.lists.count(userName: userName)
	dateJoined: {type: Date, default: Date.now}
});

userSchema.methods.serialize = function() {
	return {
		id: this._id,
		userName: this.userName,
		userDescription: this.userDescription,
		countriesVisited: this.countriesVisited,
		listsMade: this.listsMade,
		dateJoined: this.dateJoined
	};
};

userSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);


//==================== EXPORT List AND User ====================

module.exports = { List, User };

