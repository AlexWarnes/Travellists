'use strict'

function dynamicSTORE() {
	showProfiles();
	// viewThisProfile();
	// closeThisWindow();
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

$(dynamicSTORE);