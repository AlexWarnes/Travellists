'use strict'

function dynamicSTORE() {
	showLists();
	viewThisList();
	closeThisWindow();
}

//========== HOME SCREEN FUNCTIONS ==========

function showLists() {
		console.log('Getting some lists...');
		getListData(displayLists);
	};

function renderLists(item) {
	const numberOfPlaces = item.places.length;
	return `
		<article class="listPreview" id="${item.id}">
			<p class="listPreviewLocation">${item.city}, ${item.country}</p>
			<h4 class="listPreviewTitle">${item.title}</h4>
			<p class="listPreviewDescription">${item.description}</p>
			<p class="listPreviewPlacesCount">${numberOfPlaces} places in this list</p>
		</article>
	`;
}

function displayLists(data) {
	console.log(data);
	const results = data.map((item) => renderLists(item));
	$('.listsGrid').html(results);
}

function getListData(callback) {
	const settings = {
		url: '/api/lists',
		dataType: 'JSON',
		method: 'GET',
		success: callback
	};
	$.ajax(settings);
}

//========== VIEW INDIVIDUAL LIST =========

function viewThisList() {
	$('.listsGrid').on('click', '.listPreview', function(e) {
		const listId = this.id;
		console.log(`Getting info for ${listId}`);
		getThisListData(listId, displayThisList);
	})
}

function displayThisList(data) {
	console.log(data);
	const listHtml = `
		<div class="listIntro">
			<h1 class="listLocation">${data.city}, ${data.country}</h1>
			<h2 class="listTitle">${data.title}</h2>
			<p class="listDescription">${data.description}</p>
		</div>`;
	
	data.places.forEach((item) => {
		let place = `
			<li class="place">
				<h3 class="placeName">${item.placeName}</h3>
				<p class="placeDescription">${item.placeDescription}</p>
			</li>`;
		$('.singleList').html(listHtml);
		$('.listPlaces').append(place);
	});
	$('.listView').toggle(1000);
}

function getThisListData(id, callback) {
	const settings = {
		url: `/api/lists/${id}`,
		dataType: 'JSON',
		method: 'GET',
		success: callback
	};
	$.ajax(settings);
}

function closeThisWindow() {
	$('.close').on('click', function(e) {
		e.preventDefault();
		$(this).parent().toggle(1000);
	$('.singleList').html('');
	$('.listPlaces').html('');	
	})
}










$(dynamicSTORE);