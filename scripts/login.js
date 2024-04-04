import { messages } from '../lang/en/strings.js';

document.getElementById("emailLabel").textContent = messages.email;
document.getElementById("passwordLabel").textContent = messages.password;
document.getElementById("loginButton").textContent = messages.login;
document.getElementById("signupButton").textContent = messages.signup;
document.getElementById("forgotPasswordLink").textContent = messages.forgotPassword;
document.getElementById("noAccountSignUp").textContent = messages.noAccountSignUp;


//add event listener to forgotPasswordLink, on click add href to forgotPassword.html
document.getElementById("forgotPasswordLink").addEventListener("click", function() {
    //if email is not empty, redirect to forgotPassword.html
    const email = document.getElementById("emailInput").value;
    const url = '/password/forgot-password?email=' + encodeURIComponent(email); // Construct the URL with email parameter
    window.location.href = url; 
});
