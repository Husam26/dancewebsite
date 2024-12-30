document.addEventListener('DOMContentLoaded', function () {
    // Get elements for toggling
    const loginSection = document.querySelector('.login-section');
    const registerSection = document.querySelector('.register-section');
    const createAccountLink = document.getElementById('create-account-link');
    const backToLoginLink = document.getElementById('back-to-login-link');

    // Show the registration form when "Create an Account" is clicked
    createAccountLink.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default link behavior
        loginSection.style.display = 'none'; // Hide login form
        registerSection.style.display = 'block'; // Show registration form
    });

    // Show the login form when "Back to Login" is clicked
    backToLoginLink.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default link behavior
        registerSection.style.display = 'none'; // Hide registration form
        loginSection.style.display = 'block'; // Show login form
    });
});
