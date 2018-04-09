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

function closeView() {
	$('.listView').on('click', '.back-arrow', function() {
		const currentView = $(event.currentTarget).closest('.view');
		switchView(currentView, $('.gridView'));
		$('input').val('');
		$('textarea').val('');
		clearListInfo();
	});
}

function clearListInfo() {
	$('.listView-header').html('');
	$('.listView-places').html('');
}

function scrollToListViews() {
	const locationOfListViews = window.screen.width > 640 ?
		document.documentElement.clientHeight * 0.65 : 400;
	window.scrollTo({top: locationOfListViews, behavior: 'smooth'});
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
	displayThisProfile();
	viewCountriesVisited();
	viewThisList();
	closeView();
	searchLists();
	clearResults();
	logout();
}


//==================================================
//========== MY PROFILE AND MY LISTS ===============

function displayThisProfile() {
	getThisProfileData(renderThisProfileData);
	getThisUserLists(displayThisUserLists);
}

function renderThisProfileData(data) {
	const countriesCount = data.countriesVisited === null ? 
		0 : data.countriesVisited.length;

	const countriesList = data.countriesVisited === null ? 
		'None yet!' : data.countriesVisited.length === 0 ?
		'None yet!' : data.countriesVisited.join(', ');
	
	const profileHtml = `
		<div class="profile-userStats">
			<i class="profile-avatar fas fa-user-circle"></i>
			<p class="profile-countriesCount countries">${countriesCount} countries visited</p>
			<p class="profile-countriesList countries">${countriesList}</p>
		</div>
		<div class="profile-userInfo">
			<h1 class="profile-userName">${data.userName}</h1>
			<p class="profile-userDescription">${data.userDescription}</p>
		</div>
		<p class="profile-edit-icon">edit profile <i class="fas fa-pencil-alt"></i></p>`;

	return $('.traveler-profile-display').html(profileHtml);
}

function getThisProfileData(callback) {
	const splitURL = window.location.pathname.split( '/' );

	const thisUserID = splitURL[2];



	const settings = {
		url: `/api/users/${thisUserID}`,
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

function displayThisUserLists(data) {
	const splitURL = window.location.pathname.split( '/' );
	const thisUserID = splitURL[2];
	
	const userLists = data.filter(list => list.authorID === thisUserID);
	$('.listsGrid').html(userLists.map(list => renderLists(list)));
}

function getThisUserLists(callback) {
	const settings = {
		url: `/api/lists`,
		dataType: 'JSON',
		method: 'GET',
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
		},
		success: callback
	};
	$.ajax(settings);
}

function viewCountriesVisited() {
	$('.traveler-profile-display').on('click', '.countries', function(){
		$('.profile-countriesCount').toggle(300);
		$('.profile-countriesList').toggle(300).css('display', 'inline-block');
	})
}


//==================================================
//========== VIEW INDIVIDUAL LIST ==================


function viewThisList() {
	$('.listsGrid').on('click', '.listPreview', function(e) {
		clearListInfo();
		const listId = this.id;
		getThisListData(listId, displayThisList);
		switchView($('.gridView'), $('.listView'));
	})
}

function displayThisList(data) {
	const authorID = data.authorID;
	const listHtml = `
		<i class="back-arrow fas fa-arrow-left"></i>
		<div class="listIntro" id=${data.id}>
			<h2 class="listLocation">${data.city}, ${data.country}</h2>
			<h1 class="listTitle">${data.title}</h1>
			<p class="listDescription">${data.description}</p>
			<p class="listAuthor" id=${data.authorID}></p>
		</div>`;
	
	data.places.forEach((item) => {
		let place = `
			<li class="place">
				<h3 class="placeName">${item.placeName}</h3>
				<p class="placeDescription">${item.placeDescription}</p>
			</li>`;
		$('.listView-places').append(place);
	});
	$('.listView-header').html(listHtml);
	scrollToListViews();
}

function getThisListData(id, callback) {
	const settings = {
		url: `/api/lists/${id}`,
		dataType: 'JSON',
		method: 'GET',
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
		},
		success: callback
	};
	$.ajax(settings);
}


//====================================================
//========== SEARCH TOOL =============================

function searchLists() {
	$('.lists-search-button').on('click', function(e) {
		e.preventDefault();
		getMatchingLists(displayMatchedLists);
	})
}

function displayMatchedLists(data) {
	const splitURL = window.location.pathname.split( '/' );
	const thisUserID = splitURL[2];

	const query = $('#lists-search').val().toLowerCase();
	//Return an array of lists that meet criteria
	//On each list, create an array of values
	//Return true if any string value contains the query
	const matchedLists =
		data.filter(list => Object.values(list)
			.find(val => typeof val === "string" && val.toLowerCase().includes(query)));;

	//Filter matchedLists for those that are 
	//authored by the user
	const matchedListsByThisUser = matchedLists.filter(list => list.authorID === thisUserID);

	$('.clearResults').show();
	$('.listsGrid').html(matchedListsByThisUser.map(list => renderLists(list)));
	$('#lists-search').val("");
}

function getMatchingLists(callback) {
	const settings = {
		url: `/api/lists`,
		dataType: 'JSON',
		method: 'GET',
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
		},
		success: callback
	};
	$.ajax(settings);
}

function clearResults() {
	$('.clearResults').on('click', function() {
		$('.clearResults').hide();
		getThisUserLists(displayThisUserLists);
	});
}

$(STARTUP);