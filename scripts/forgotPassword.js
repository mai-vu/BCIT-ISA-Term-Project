import { messages } from '../lang/en/strings.js';


document.addEventListener("DOMContentLoaded", function() {
    // Function to get query parameter from URL
    const getQueryParam = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };

    // Get the email parameter from the URL
    const email = getQueryParam('email');

    // Display the email in the designated element
    const emailDisplayElement = document.getElementById("forgotPasswordText");

    if (email) {
        // Perform a database check here
        fetch('/password/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                emailDisplayElement.textContent = messages.forgotPasswordText + decodeURIComponent(email);
            } else {
                emailDisplayElement.textContent = messages.emailNotFound + decodeURIComponent(email);
            }
        })
        .catch(error => {
            console.error('Error checking email:', error);
            emailDisplayElement.textContent = "Error checking email.";
        });
    } else {
        emailDisplayElement.textContent = "Email not found.";
    }
});

