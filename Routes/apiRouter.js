'use strict';

const express = require('express');
const faker = require('faker');
const router = express.Router();

function makeFakeList() {
	const list = {
		city: faker.address.city(),
		country: faker.address.country(),
		title: faker.company.catchPhrase(),
		description: faker.lorem.sentence(),
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
		dateCreated: faker.date.recent()
	};
	return list;
};


//USED FOR CALLS TO /api

router.get('/lists', (req, res, next) => {
	let fakerLists = [];
	for (let i=0; i<5; i++) {
		let list = makeFakeList();
		fakerLists.push(list);
	};
	res.status(200).json(fakerLists);
});

router.get('/lists/:id', (req, res, next) => {
	res.status(200).send('Add this route with test DB');
})

router.get('/travelers', (req, res, next) => {
	res.status(200).send('Feature set planned for Phase Two!');
});

router.get('/travelers/:id', (req, res, next) => {
	res.status(200).send('This might be how we display profiles to users');
});



module.exports = router;