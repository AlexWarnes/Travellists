'use strict'


//==================================================
//========== TOOLBOX ===============================

const STORE = {
	userToken: localStorage.getItem('userToken')
}

function switchView(currentView, nextView) {
	currentView.slideToggle({
		duration: 500, 
		complete: nextView.slideToggle(500)
	});
}

function verifyLogin() {
	if (STORE.userToken) {
		$('.noAuth').toggle();
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
	logout();
}









$(STARTUP);