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
	$('.close').on('click', function() {
		const currentView = $(event.currentTarget).closest('.view');
		switchView(currentView, $('.gridView'));
		$('input').val('');
		clearListInfo();
	});
}

function clearListInfo() {
	$('.singleList').html('');
	$('.listPlaces').html('');
}

function verifyLogin() {
	if (STORE.userToken) {
		$('.noAuth').toggle(100);
		$('.auth').fadeIn(300);
	}
}

function logout() {
	$('.logout').on('click', function(e) {
		e.preventDefault();
		STORE.userToken = null;
		localStorage.removeItem('userToken');
		location.replace('/');
		verifyLogin();
	});
}

function STARTUP() {
	verifyLogin();
	showLists();
	viewThisList();
	closeView();
	openListForm();
	cancelNewList();
	addAnotherPlace();
	submitList();
	deleteThisList();
	updateList();
	editList();
	editAddAnotherPlace();
	cancelEditList();
	searchLists();
	clearResults();
	logout();
}


//==================================================
//========== GRID VIEW FUNCTIONS ===================


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
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
		},
		success: callback
	};
	$.ajax(settings);
}


//==================================================
//========== VIEW INDIVIDUAL LIST ==================


function viewThisList() {
	$('.listsGrid').on('click', '.listPreview', function(e) {
		clearListInfo();
		const listId = this.id;
		console.log(`Getting info for ${listId}`);
		getThisListData(listId, displayThisList);
	})
}

function displayThisList(data) {
	console.log(data);
	const authorID = data.authorID;
	const listHtml = `
		<div class="listIntro" id=${data.id}>
			<h1 class="listLocation">${data.city}, ${data.country}</h1>
			<h2 class="listTitle">${data.title}</h2>
			<p class="listDescription">${data.description}</p>
			<p class="listAuthor" id=${data.authorID}></p>
		</div>`;
	
	data.places.forEach((item) => {
		let place = `
			<li class="place">
				<h3 class="placeName">${item.placeName}</h3>
				<p class="placeDescription">${item.placeDescription}</p>
			</li>`;
		$('.listPlaces').append(place);
	});
	$('.singleList').html(listHtml);
	verifyEditDeletePermission(authorID)
	switchView($('.gridView'), $('.listView'));
}

function verifyEditDeletePermission(authorID) {
	if (localStorage.userID === authorID) {
		$('.editIcons').show();
	} else {
		$('.editIcons').hide();
	}
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


//==================================================
//========== CREATE NEW LIST =======================

function openListForm() {
	$('.newListButton').on('click', function(e) {
		e.preventDefault();
		switchView($('.gridView'), $('.newListFieldset'));
	});
}

function cancelNewList() {
	$('.cancelNewButton').on('click', function(e) {
		e.preventDefault();
		switchView($('.newListFieldset'), $('.gridView'));
		resetListForm();
	})
}

function addAnotherPlace() {
	$('.addPlace').on('click', function(e) {
		e.preventDefault();
		const placeIndex = $('.newListPlace').length;
		const placeFields = `
			<li class="newListPlace">
				<label for="placeName-${placeIndex}">Place Name</label>
				<input type="text" name="placeName" id="placeName-${placeIndex}" class="newListPlaceName listInput">

				<label for="placeDescription-${placeIndex}">Place Description</label>
				<input type="text" name="placeDescription" id="placeDescription-${placeIndex}" class="newListPlaceDescription listInput">
			</li>
		`		
		console.log(placeIndex);
		$('.listFormPlaces').append(placeFields);
	});
}

function renderNewListPlaces() {
	const arrayOfPlaces = [];
	
	for (let i = 0; i < $('.newListPlace').length; i++) {
		const currentPlaceName = `placeName-${i}`;
		const currentPlaceDescription = `placeDescription-${i}`;

		arrayOfPlaces[i] = {
			placeName: $('#' + currentPlaceName).val(),
			placeDescription: $('#' + currentPlaceDescription).val()
		}
	}
	return arrayOfPlaces;
}

function submitList() {
	$('.submitListButton').on('click', function(e) {
		e.preventDefault();
		const arrayOfPlaces = renderNewListPlaces();
		const dateCreated = new Date().toISOString();
		const newList = {
			// author: 'testUser',
			dateCreated: dateCreated,
			city: $('#newListCity').val(),
			country: $('#newListCountry').val(),
			title: $('#newListTitle').val(),
			description: $('#newListDescription').val(),
			places: arrayOfPlaces
		};
		const newListJson = JSON.stringify(newList);
		const settings = {
			url: '/api/lists',
			data: newListJson,
			contentType: 'application/json',
			beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
			},
			type: 'POST',
			success: successfulPost
		}
		$.ajax(settings);
	});
}

function successfulPost() {
	switchView($('.newListFieldset'), $('.gridView'));
	showLists();
	resetListForm();
}

function resetListForm() {
	$('.listFormPlaces').html(`
		<li class="newListPlace">
			<label for="placeName-0">Place Name</label>
			<input type="text" name="placeName" id="placeName-0" class="newListPlaceName listInput">

			<label for="placeDescription-0">Place Description</label>
			<input type="text" name="placeDescription" id="placeDescription-0" class="newListPlaceDescription listInput">
		</li>
	`);
	$('.newListForm input').val('');
}


//==================================================
//========== DELETE LIST ===========================


function deleteThisList() {
	$('.list-trash').on('click', function(e) {
		e.preventDefault();
		$('.list-warning-deleteList').fadeIn(500);
	});

	$('.list-doNotDelete').on('click', function(e) {
		e.preventDefault();
		$('.list-warning-deleteList').fadeOut(500);
	});

	$('.list-confirmDelete').on('click', function(e) {
		e.preventDefault();
		const listId = $('.listIntro').attr('id');
		const settings = {
			url: `/api/lists/${listId}`,
			type: 'DELETE',
			beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
			},
			success: successfulListDelete
		}
		console.log(settings);
		$.ajax(settings);
	});	
}

function successfulListDelete() {
	$('.list-warning-deleteList').fadeOut(500);
	switchView($('.listView'), $('.gridView'))		
	clearListInfo();
	showLists();
	console.log('successfully deleted that list');
}


//==================================================
//========== EDIT LIST =============================


function editList() {
	$('.editList').on('click', function(e) {
		e.preventDefault();
		const listId = $('.listIntro').attr('id');
		console.log(`Getting info for ${listId}`);
		switchView($('.listView'), $('.editListFieldset'));
		getThisListData(listId, populateEditFields);
	});
}

function populateEditFields(data) {
	$('.editListForm').attr('id', data.id);
	$('#editListCity').val(`${data.city}`);
	$('#editListCountry').val(`${data.country}`);
	$('#editListTitle').val(`${data.title}`);
	$('#editListDescription').val(`${data.description}`);
	renderPlaces(data);
}

function renderPlaces(data) {
	const numberOfPlaces = data.places.length;
	for (let i = 0; i < numberOfPlaces; i++) {
		// console.log(data.places[i]);
		$('.editListPlaces').append(`
			<li class="editListPlace">
				<label for="editPlaceName-${i}">Place Name</label>
				<input type="text" value="${data.places[i].placeName}" name="placeName" id="editPlaceName-${i}" class="editListPlaceName listInput">

				<label for="editPlaceDescription-${i}">Place Description</label>
				<input type="text" value="${data.places[i].placeDescription}" name="placeDescription" id="editPlaceDescription-${i}" class="editListPlaceDescription listInput">
			</li>
		`);
	}
}

function editAddAnotherPlace() {
	$('.editAddPlace').on('click', function(e) {
		e.preventDefault();
		const placeIndex = $('.editListPlace').length;
		console.log('place index is ' + placeIndex);
		const placeFields = `
			<li class="editListPlace">
				<label for="editPlaceName-${placeIndex}">Place Name</label>
				<input type="text" name="placeName" id="editPlaceName-${placeIndex}" class="editListPlaceName listInput">

				<label for="editPlaceDescription-${placeIndex}">Place Description</label>
				<input type="text" name="placeDescription" id="editPlaceDescription-${placeIndex}" class="editListPlaceDescription listInput">
			</li>
		`		
		console.log(placeIndex);
		$('.editListPlaces').append(placeFields);
	});
}

function updateList() {
	$('.updateListButton').on('click', function(e) {
		e.preventDefault();
		const arrayOfPlaces = renderUpdatedListPlaces();
		const listId = $('.editListForm').attr('id');
		
		const updatedList = {
			id: listId,
			city: $('#editListCity').val(),
			country: $('#editListCountry').val(),
			title: $('#editListTitle').val(),
			description: $('#editListDescription').val(),
			places: arrayOfPlaces
		};
		
		const updatedListJson = JSON.stringify(updatedList);
		
		const settings = {
			url: `/api/lists/${listId}`,
			data: updatedListJson,
			contentType: 'application/json',
			type: 'PUT',
			beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
			},
			success: successfulUpdate
		}
		console.log(updatedListJson);
		$.ajax(settings);
	});
}

function renderUpdatedListPlaces() {
	const arrayOfPlaces = [];
	
	for (let i = 0; i < $('.editListPlace').length; i++) {
		const currentPlaceName = `editPlaceName-${i}`;
		const currentPlaceDescription = `editPlaceDescription-${i}`;

		arrayOfPlaces[i] = {
			placeName: $('#' + currentPlaceName).val(),
			placeDescription: $('#' + currentPlaceDescription).val()
		}
	}
	return arrayOfPlaces;
}

function successfulUpdate() {
	switchView($('.editListFieldset'), $('.listView'));
	const listId = $('.listIntro').attr('id');
	clearListInfo();
	getThisListData(listId, displayThisList);
	resetEditListForm();
}

function resetEditListForm() {
	$('.editListPlaces').html('');
	$('.listInput').val('');
	$('.editListForm').attr('id');
}

function cancelEditList() {
	$('.cancelEditButton').on('click', function(e) {
		e.preventDefault();
		switchView($('.editListFieldset'), $('.listView'));
		resetEditListForm();
	});
}


//==================================================
//========== SEARCH TOOL =============================

function searchLists() {
	$('.lists-searchButton').on('click', function(e) {
		e.preventDefault();
		getMatchingLists(displayMatchedLists);
	})
}

function displayMatchedLists(data) {
	const query = $('#lists-search').val().toLowerCase();
	//Return an array of lists that meet criteria
	//On each list, create an array of values
	//Return true if any string value contains the query
	const matchedLists =
		data.filter(list => Object.values(list)
			.find(val => typeof val === "string" && val.toLowerCase().includes(query)));
	$('.clearResults').toggle();
	$('.listsGrid').html(matchedLists.map(list => renderLists(list)));
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
		$('.clearResults').toggle();
		showLists();
	});
}

$(STARTUP);
