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
	showProfiles();
	viewThisProfile();
	closeThisWindow();
	logout();
}

//========== HOME SCREEN FUNCTIONS ==========

function showProfiles() {
		console.log('Getting some profiles...');
		getProfileData(displayProfiles);
	};

function renderProfiles(item) {
	const numberOfCountries = item.countriesVisited.length;
	return `
		<article class="profilePreview" id="${item.id}">
			<h4 class="profilePreviewUserName"><i class="fas fa-user"></i>  ${item.userName}</h4>
			<p class="profilePreviewDescription">${item.userDescription}</p>
			<p class="profilePreviewCountries">${numberOfCountries} countries visited</p>
		</article>
	`;
}

function displayProfiles(data) {
	console.log(data);
	const results = data.map((item) => renderProfiles(item));
	$('.profilesGrid').html(results);
}

function getProfileData(callback) {
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


//========== VIEW INDIVIDUAL PROFILE =========

function clearProfileHtml() {
	$('.profilePreview').attr('id');
	$('.singleProfile').html('');
}

function viewThisProfile() {
	$('.profilesGrid').on('click', '.profilePreview', function(e) {
		clearProfileHtml();
		const profileId = this.id;
		console.log(`Getting info for ${profileId}`);
		// $('.profilesGrid').toggle(750);
		switchView($('.profileGridView'), $('.profileView'));
		getThisProfileData(profileId, displayThisProfile);
	})
}

function displayThisProfile(data) {
	console.log(data);
	const countriesVisited = data.countriesVisited //add spacing between words;
	const profileHtml = `
		<div class="profileIntro" id="${data.id}">
			<h1 class="profileUserName">${data.userName}</h1>
			<h2 class="profileUserDescription">${data.userDescription}</h2>
			<p class="profileCountries"><span class="profileCoutriesVisited">Countries Visited: </span>${countriesVisited}</p>
		</div>`;

	$('.singleProfile').html(profileHtml);
}

function getThisProfileData(id, callback) {
	const settings = {
		url: `/api/users/${id}`,
		dataType: 'JSON',
		method: 'GET',
		beforeSend: function(xhr, settings) { 
			xhr.setRequestHeader('Authorization', `Bearer ${STORE.userToken}`); 
		},
		success: callback
	};
	$.ajax(settings);
}

function closeThisWindow() {
	$('.close').on('click', function() {
		const currentView = $(event.currentTarget).closest('.view');
		switchView(currentView, $('.profileGridView'));
		clearProfileHtml();
	})
}

$(STARTUP);

