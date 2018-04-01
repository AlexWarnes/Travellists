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

function verifyString(value) {
	
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

		if (typeof userName !== 'string' || typeof password !== 'string') {
			$('.string-warning').fadeIn(400);
			setTimeout(function(){
				$('.string-warning').fadeOut(800)
			}, 6000);
		} else if (userName !== userName.trim() || password !== password.trim()) {
			$('.space-warning').fadeIn(400);
			setTimeout(function(){
				$('.space-warning').fadeOut(800)
			}, 6000);
		} else if (userName.length < 1 || userName.length > 20) {
			$('.usernameLength-warning').fadeIn(400);
			setTimeout(function(){
				$('.usernameLength-warning').fadeOut(800)
			}, 6000);
		} else if (password.length < 10 || password.length > 72) {
			$('.passwordLength-warning').fadeIn(400);
			setTimeout(function(){
				$('.passwordLength-warning').fadeOut(800)
			}, 6000);
		} else if (password !== $('#confirmPassword').val()) {
			$('.passwordMatch-warning').fadeIn(400);
			setTimeout(function(){
				$('.passwordMatch-warning').fadeOut(800)
			}, 6000);
		} else {
			const settings = {
				url: '/api/users',
				data: newUserJson,
				contentType: 'application/json',
				type: 'POST',
				success: successfulCreateAccount,
				error: createAccountError
			}
			$.ajax(settings);
		}
	});	
}

function successfulCreateAccount() {
	$('.welcome').fadeIn(200);
	switchView($('.index-createAccount'), $('.index-login'));
}

function createAccountError() {
	$('.duplicateUsername-warning').fadeIn(400);
		setTimeout(function(){
			$('.duplicateUsername-warning').fadeOut(800)
		}, 6000);;
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
		success: successfulLogin,
		error: loginError
	}
	$.ajax(settings);	
}

function successfulLogin(data) {
	localStorage.setItem('userToken', data.authToken);
	localStorage.setItem('userID', data.userID);
	location.replace('/');
}

function loginError() {
	$('.credentials-warning').fadeIn(400);
		setTimeout(function(){
			$('.credentials-warning').fadeOut(800)
		}, 6000);;
}

$(STARTUP);


