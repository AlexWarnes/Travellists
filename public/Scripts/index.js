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

function closeForm() {
	$('.close').on('click', function() {
		const currentView = $(event.currentTarget).closest('.view');
		switchView(currentView, $('.index-welcome'));
		$('input').val('');
	});
}

function verifyLogin() {
	if (STORE.userToken !== null) {
		$('.auth').fadeIn(300);
	} else {
		$('.noAuth').fadeIn(300);
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
	openCreateAccount();
	closeForm();
	openLoginForm();
	login();
	createNewAccount();
	logout();
}

//==================================================
//========== CREATE NEW ACCOUNT FORM ===============


function openCreateAccount() {
	$('.openCreateAccount').on('click', function(e) {
		e.preventDefault();
		switchView($('.index-welcome'), $('.index-createAccount'));
	});
}

function createNewAccount() {
	$('.createNewAccountButton').on('click', function(e) {
		e.preventDefault();

		const userName = $('#createUsername').val();
		const password = $('#createPassword').val();

		const newUser = {
			userName: userName,
			password: password,
			userDescription: '',
			email: '',
			countriesVisited: [],
			dateJoined: new Date().toISOString()
		}
		const newUserJson = JSON.stringify(newUser);

		if (password === $('#confirmPassword').val()) {
			const settings = {
				url: '/api/users',
				data: newUserJson,
				contentType: 'application/json',
				type: 'POST',
				success: successfulCreateAccount
			}
			$.ajax(settings);
		} else {
			$('.passwordWarning').fadeIn(400);
			setTimeout(function(){
				$('.passwordWarning').fadeOut(800)
			}, 6000);
		}
	});	
}

function successfulCreateAccount() {
	$('.welcome').fadeIn(200);
	switchView($('.index-createAccount'), $('.index-login'));
}


//==================================================
//========== LOGIN FORM ============================

function openLoginForm() {
	$('.loginLink').on('click', function(e) {
		e.preventDefault();
		switchView($('.index-login'), $('.index-welcome'));
	});
}

function login() {
	$('.loginButton').on('click', function(e) {
		e.preventDefault();
		const credentials = {
			userName: $('#loginUsername').val(),
			password: $('#loginPassword').val()
		}
		const credentialsJson = JSON.stringify(credentials);

		issueToken(credentialsJson);
	});
}

function issueToken(userInfo) {
	const settings = {
		url: '/auth/login',
		data: userInfo,
		contentType: 'application/json',
		type: 'POST',
		success: successfulLogin
	}
	$.ajax(settings);	
}

function successfulLogin(data) {
	alert('SUCCESS!');
	localStorage.setItem('userToken', data.authToken);
	localStorage.setItem('userID', data.userID);
	location.replace('/');
}

$(STARTUP);


