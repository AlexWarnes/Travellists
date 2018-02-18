'use strict'

function dynamicSTORE() {
	showProfiles();
	viewThisProfile();
	closeThisWindow();
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
		success: callback
	};
	$.ajax(settings);
}


//========== VIEW INDIVIDUAL PROFILE =========

function clearProfileHtml() {
	$('.singleProfile').html('');
}

function viewThisProfile() {
	$('.profilesGrid').on('click', '.profilePreview', function(e) {
		clearProfileHtml();
		const profileId = this.id;
		console.log(`Getting info for ${profileId}`);
		$('.profilesGrid').toggle(750);
		getThisProfileData(profileId, displayThisProfile);
	})
}

function displayThisProfile(data) {
	console.log(data);
	const countriesVisited = data.countriesVisited //add spacing between words;
	const profileHtml = `
		<div class="profileIntro">
			<h1 class="profileUserName">${data.userName}</h1>
			<h2 class="profileUserDescription">${data.userDescription}</h2>
			<p class="profileCountries"><span class="profileCoutriesVisited">Countries Visited: </span>${countriesVisited}</p>
		</div>`;

	$('.singleProfile').html(profileHtml);
	$('.profileView').toggle(1000);
}

function getThisProfileData(id, callback) {
	const settings = {
		url: `/api/users/${id}`,
		dataType: 'JSON',
		method: 'GET',
		success: callback
	};
	$.ajax(settings);
}

function closeThisWindow() {
	$('.close').on('click', function(e) {
		e.preventDefault();
		$(this).parent().toggle(750);
		$('.profilesGrid').toggle(1000);		
		clearProfileHtml();
	})
}

$(dynamicSTORE);