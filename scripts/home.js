// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

// const apiUrl = "http://localhost:3000/predict";
const apiUrl = "https://www.alexkong.xyz/proj/predict";

// Function to replace element contents with strings from messages object
function replaceElementContents() {
    // Replace title
    document.getElementById('title').textContent = messages.title;
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', replaceElementContents);

document.getElementById('submitButton').addEventListener('click', function() {
    let text = document.getElementById('userInput').value;
    let data = { text: text };

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        let query = document.createElement('h3');
        query.textContent = text;
        document.getElementById('chatbox').appendChild(query);
        let response = document.createElement('p');
        response.textContent = data.prediction;
        document.getElementById('chatbox').appendChild(response);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });