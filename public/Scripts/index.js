'use strict'

function STARTUP() {
	showLists();
	viewThisList();
	xThisWindow();
	openListForm();
	closeForm();
	addAnotherPlace();
	submitList();
	deleteThisList();
}


//========== HOME SCREEN FUNCTIONS ==========
// ====================================

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
// ====================================

function clearListInfo() {
	$('.singleList').html('');
	$('.listPlaces').html('');
	$('.editIcons').removeAttr('id');
}

function viewThisList() {
	$('.listsGrid').on('click', '.listPreview', function(e) {
		clearListInfo();
		const listId = this.id;
		console.log(`Getting info for ${listId}`);
		$('.gridView').toggle(750);
		getThisListData(listId, displayThisList);
	})
}

function displayThisList(data) {
	console.log(data);
	const listHtml = `
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
	$('.editIcons').attr('id', `${data.id}`);
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


//========== CLOSE WINDOW =========
// ====================================

function xThisWindow() {
	$('.close').on('click', function(e) {
		e.preventDefault();
		$(this).parent().toggle(750);
		$('.gridView').toggle(1000);		
		clearListInfo();

	})
}

function closeListView() {
	$('.listView').toggle(750);
	$('.gridView').toggle(1000);		
	clearListInfo();
}


//========== CREATE NEW LIST =========
// ====================================


function openListForm() {
	$('.newListButton').on('click', function(e) {
		e.preventDefault();
		$('.gridView').toggle(750);
		$('.newListFieldset').toggle(1000);
	});
}

function closeForm() {
	$('.cancelButton').on('click', function(e) {
		e.preventDefault();
		$(this).closest('fieldset').toggle(750);
		$('.gridView').toggle(1000);
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
			author: 'testUser',
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
			type: 'POST',
			success: successfulPost
		}
		$.ajax(settings);
	});
}

function successfulPost() {
	$('fieldset').toggle(500);
	$('.gridView').toggle(500);
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


//========== DELETE LIST =========
// ====================================

function deleteThisList() {
	$('.trash').on('click', function(e) {
		e.preventDefault();
		$('.deleteWarning').toggle(500);
	});

	$('.doNotDelete').on('click', function(e) {
		e.preventDefault();
		$('.deleteWarning').toggle(500);
	});

	$('.confirmDelete').on('click', function(e) {
		e.preventDefault();
		const listId = $('.editIcons').attr('id');
		const settings = {
			url: `/api/lists/${listId}`,
			type: 'DELETE',
			success: [successfulDelete, closeListView, showLists]
		}
		$.ajax(settings);
	});	
}

function successfulDelete() {
	$('.deleteWarning').toggle(500);
	console.log('successfully deleted that list');
}


//========== EDIT LIST =========
// ====================================

// click edit
// 	turn listView into inputs
// 			click save this list and 
// 				if any input.val() !== data.string make it for update var
// 					PUT update fields in AJAX 
// 			click cancel 
// 				turn inputs into listView




$(STARTUP);


