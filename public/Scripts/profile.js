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
		complete: nextView.slideToggle("slow")
	});
}

function verifyLogin() {
	if (STORE.userToken) {
		$('.noAuth').toggle();
		$('.auth').fadeIn(300);
	}
}

function closeView() {
	$('.profile-singleList').on('click', '.close', function() {
		const currentView = $(event.currentTarget).closest('.view');
		switchView(currentView, $('.profile-listsGrid'));
		$('.profile-listViews input').val('');
		clearListInfo();
	});
}

function clearListInfo() {
	$('.singleList').html('');
	$('.listPlaces').html('');
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
	displayMyProfile();
	editProfile();
	updateProfile();
	cancelEditProfile();
	viewThisList();
	openListForm();
	cancelNewList();
	addAnotherPlace();
	submitList();
	closeView();
	deleteThisList();
	editList();
	editAddAnotherPlace();
	updateList();
	cancelEditList();
	deleteProfile();
	logout();
}


//==================================================
//========== MY PROFILE AND MY LISTS ===============

function displayMyProfile() {
	getMyProfileData(renderMyProfileData);
	getMyLists(displayMyLists);
}

function renderMyProfileData(data) {
	const profileHtml = `
		<div class="profile-userStats">
			<i class="profile-avatar fas fa-user-circle"></i>
			<ul>
				<li class="profile-countriesVisited">${data.userName} has traveled to ${data.countriesVisited.length} countries</li>
			</ul>
		</div>
		<div class="profile-userInfo">
			<h1 class="profile-userName">${data.userName}</h1>
			<p class="profile-userDescription">${data.userDescription}</p>
		</div>
		<i class="profile-edit-icon fas fa-pencil-alt"></i>`;
	fillProfileEditForm(data);
	return $('.profile-display').html(profileHtml);
}

function getMyProfileData(callback) {
	const settings = {
		url: `/api/users/${STORE.userID}`,
		dataType: 'JSON',
		method: 'GET',
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
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

function displayMyLists(data) {
	const query = STORE.userID;
	const userLists = data.filter(list => list.authorID === query);
	$('.profile-listsGrid').html(userLists.map(list => renderLists(list)));
}

function getMyLists(callback) {
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


//==================================================
//========== EDIT PROFILE ==========================

function editProfile() {
	$('.profile-display').on('click', '.profile-edit-icon', function() {
		switchView($('.profile-display'), $('.profile-editFields'));
	});
}

function fillProfileEditForm(data) {
	//This runs with data passed on page-load
	$('#profile-edit-userName').val(`${data.userName}`);
	$('#profile-edit-userDescription').val(`${data.userDescription}`);
	$('#profile-edit-countries').val(`${data.countriesVisited}`);
}

function cancelEditProfile() {
	$('.profile-cancel-button').on('click', function(e) {
		e.preventDefault();
		displayMyProfile();
		switchView($('.profile-editFields'), $('.profile-display'))
	})
}

function updateProfile() {
	$('.profile-update-button').on('click', function(e) {
		e.preventDefault();
		
		const updatedProfile = {
			id: STORE.userID,
			userName: $('#profile-edit-userName').val(),
			userDescription: $('#profile-edit-userDescription').val(),
			countriesVisited: convertCountriesToArray($('#profile-edit-countries').val())
		};

		const updatedProfileJson = JSON.stringify(updatedProfile);

		const settings = {
			url: `/api/users/${STORE.userID}`,
			data: updatedProfileJson,
			contentType: 'application/json',
			type: 'PUT',
			beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`);},
			success: successfulProfileUpdate
		}
		console.log(updatedProfileJson);
		$.ajax(settings);
	})
}

function convertCountriesToArray(input) {
	const splitString = input.split(',');
	return splitString.map(val => val.trim());
}

function successfulProfileUpdate() {
	displayMyProfile();
	switchView($('.profile-editFields'), $('.profile-display'))
}


//==================================================
//========== DELETE PROFILE ========================

function deleteProfile() {
	$('.profile-delete-button').on('click', function() {
		$('.profile-warning-deleteProfile').fadeIn(500);
	});

	$('.profile-doNotDelete').on('click', function(e) {
		e.preventDefault();
		$('.profile-warning-deleteProfile').fadeOut(500);
	});

	$('.profile-confirmDelete').on('click', function(e) {
		e.preventDefault();
		const settings = {
			url: `/api/users/${STORE.userID}`,
			type: 'DELETE',
			beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
			},
			success: successfulProfileDelete
		}
		$.ajax(settings);
	});	
}

function successfulProfileDelete() {
	STORE.userToken = null;
	STORE.userID = null;
	localStorage.removeItem('userToken');
	location.replace('/');
}



//==================================================
//==================================================
//========== LIST FUNCTIONALITY ====================


//==================================================
//========== VIEW INDIVIDUAL LIST ==================

function viewThisList() {
	$('.profile-listsGrid').on('click', '.listPreview', function(e) {
		clearListInfo();
		const listId = this.id;
		console.log(`Getting info for ${listId}`);
		getThisListData(listId, displayThisList);
	})
}

function displayThisList(data) {
	console.log(data);
	const listHtml = `
		<i class="close far fa-times-circle"></i>
		<div class="listIntro" id=${data.id}>
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
		$('.listPlaces').append(place);
	});
	$('.singleList').html(listHtml);
	switchView($('.profile-listsGrid'), $('.profile-singleList'));
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
		$('.newListFieldset').slideDown(500);
	});
}

function cancelNewList() {
	$('.cancelNewButton').on('click', function(e) {
		e.preventDefault();
		$('.newListFieldset').slideUp(500);
		resetListForm();
	});
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
	$('.newListFieldset').slideUp(500);
	getMyLists(displayMyLists);
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
		$.ajax(settings);
	});	
}

function successfulListDelete() {
	$('.list-warning-deleteList').fadeOut(500);
	switchView($('.profile-singleList'), $('.profile-listsGrid'))		
	clearListInfo();
	getMyLists(displayMyLists);
	console.log('successfully deleted that list');
}


//==================================================
//========== EDIT LIST =============================


function editList() {
	$('.editList').on('click', function(e) {
		e.preventDefault();
		const listId = $('.listIntro').attr('id');
		console.log(`Getting info for ${listId}`);
		$('.editListFieldset').slideDown(500);
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
	$('.editListFieldset').slideUp();
	const listId = $('.listIntro').attr('id');
	clearListInfo();
	switchView($('.profile-singleList'), $('.profile-listsGrid'));	
	getMyLists(displayMyLists);
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
		$('.editListFieldset').slideUp();
		resetEditListForm();
	});
}

$(STARTUP);