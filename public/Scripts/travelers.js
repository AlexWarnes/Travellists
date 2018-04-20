'use strict'


//==================================================
//========== TOOLBOX ===============================

const STORE = {
	userToken: localStorage.getItem('userToken'),
	userID: localStorage.getItem('userID')
}

function switchView(currentView, nextView) {
	currentView.slideToggle({
		duration: 500, 
		complete: nextView.slideToggle(500)
	});
}

function verifyLogin() {
	if (STORE.userToken !== null) {
		$('.noAuth').hide();
		$('.auth').fadeIn(300);
	} else {
		$('.auth').hide();
		$('.noAuth').fadeIn(300);
	}
}

function logout() {
	$('.logout').on('click', function(e) {
		e.preventDefault();
		STORE.userToken = null;
		localStorage.removeItem('userToken');
		localStorage.removeItem('userID');
		location.replace('/');
		verifyLogin();
	});
}

function STARTUP() {
	verifyLogin();
	showTravelers();
	searchTravelers();
	clearResults();
	logout();
}


//====================================================
//========== TRAVELERS GRID VIEW FUNCTIONS ===========

function showTravelers() {
		getTravelerData(displayTravelers);
	};

function renderTravelers(item) {
	const numberOfCountries = item.countriesVisited.length;
	const countriesList = item.countriesVisited === null ? 
			'None yet!' : item.countriesVisited.length === 0 ?
			'None yet!' : item.countriesVisited.join(', ');

	return `
		<a href="/travelers/${item.id}" class="travelerPreview-link">
			<article class="travelerPreview" id="${item.id}">
				<div class="travelerPreview-header">
					<h4 class="travelerPreviewUserName"><i class="fas fa-user"></i>  ${item.userName}</h4>
				</div>
				<div class="travelerPreview-body">
					<p class="travelerPreviewDescription">${item.userDescription}</p>
					<p class="travelerPreviewCountries">Countries Visited: ${countriesList}</p>
				</div>
			</article>
		</a>
	`;
}

function displayTravelers(data) {
	const results = data.map((item) => renderTravelers(item));
	$('.travelersGrid').html(results);
}

function getTravelerData(callback) {
	const settings = {
		url: '/api/users',
		dataType: 'JSON',
		method: 'GET',
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
		},
		statusCode: {
			401: function() {
				STORE.userToken = null;
				localStorage.removeItem('userToken');
				localStorage.removeItem('userID');
				location.replace('/');
				verifyLogin();
			}
		},
		success: callback
	};
	$.ajax(settings);
}


//====================================================
//========== SEARCH TOOL =============================

function searchTravelers() {
	$('.traveler-search-button').on('click', function(e) {
		e.preventDefault();
		getMatchingTravelers(displayMatchedTravelers);
	})
}

function displayMatchedTravelers(data) {
	const query = $('#traveler-search').val().toLowerCase();
	//Return an array of lists that meet criteria
	//On each list, create an array of values
	//Return true if any string value contains the query
	const matchedTravelers =
		data.filter(traveler => Object.values(traveler)
			.find(val => typeof val === "string" ? 
				val.toLowerCase().includes(query) :
				val.find(arrVal => arrVal.toLowerCase().includes(query))));
	$('.clearResults').show();
	$('.travelersGrid').html(matchedTravelers.map(traveler => renderTravelers(traveler)));
	$('#traveler-search').val("");
}

function getMatchingTravelers(callback) {
	const settings = {
		url: '/api/users',
		dataType: 'JSON',
		method: 'GET',
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
		},
		statusCode: {
			401: function() {
				STORE.userToken = null;
				localStorage.removeItem('userToken');
				localStorage.removeItem('userID');
				location.replace('/');
				verifyLogin();
			}
		},
		success: callback
	};
	$.ajax(settings);
}

function clearResults() {
	$('.clearResults').on('click', function() {
		$('.clearResults').hide();
		showTravelers();
	});
}


$(STARTUP);


