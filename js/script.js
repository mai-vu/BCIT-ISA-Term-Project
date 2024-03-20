// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

// Function to replace element contents with strings from messages object
function replaceElementContents() {
    document.getElementById('title').textContent = messages.title;
    document.getElementById('test').textContent = messages.test;
    document.getElementById('submitButton').textContent = messages.submitButton;
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', replaceElementContents);