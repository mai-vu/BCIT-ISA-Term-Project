// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

// Function to replace element contents with strings from messages object
function replaceElementContents() {
    document.getElementById('title').textContent = messages.title;
    document.getElementById('header').textContent = messages.header;
    document.getElementById('submitButton').textContent = messages.submitButton;
    document.getElementById('footer').textContent = messages.footer;
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', replaceElementContents);