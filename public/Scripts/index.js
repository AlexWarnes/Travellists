'use strict'

function viewLists() {
	$('.viewListsButton').on('click', function(e) {
		e.preventDefault();
		console.log('Making some lists...');
		getListData(displayLists);
	});
}

function renderLists(item) {
	const numberOfPlaces = item.places.length;
	return `
		<a href="/lists/id">
			<article class="list">
				<p class="listLocation">${item.city}, ${item.country}</p>
				<h4 class="listTitle">${item.title}</h4>
				<p class="listDescription">${item.description}</p>
				<p class="placesCount">${numberOfPlaces} places in this list</p>
			</article>
		</a>
	`;
}

function displayLists(data) {
	console.log(data);
	const results = data.map((item) => renderLists(item));
	$('.listsSection').html(results);
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

$(viewLists);