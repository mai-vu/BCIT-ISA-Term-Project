// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

const apiUrl = "https://www.alexkong.xyz/proj/predict";

// Function to replace element contents with strings from messages object
function replaceElementContents() {
    // Replace title
    document.getElementById('title').textContent = messages.home;
    // document.getElementById('title').textContent = messages.title;
    // document.getElementById('searchHeader').textContent = messages.searchHeader;
    // document.getElementById('insertRows').textContent = messages.insertRows;
    // document.getElementById('submitQuery').textContent = messages.submitQuery;
    document.getElementById('usageCount').innerText = messages.usageCount
    document.getElementById('logoutButton').textContent = messages.logout;
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', replaceElementContents);

// Function to fetch and update the usage count
async function updateUsageCount() {
    try {
        // Fetch the usage count from the server
        const response = await fetch('/usagecount');
        const data = await response.json();
        
        // Update the usage count in the span element
        document.getElementById('usageCount').innerText += data.apiCalls;
    } catch (error) {
        console.error('Error updating usage count:', error);
    }
}

// Call the function to update the usage count initially
updateUsageCount();

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
        let query = document.createElement('h5');
        query.textContent = '"' + text + '"';
        document.getElementById('chatbox').appendChild(query);
        let response = document.createElement('p');
        response.textContent = data.prediction;
        document.getElementById('chatbox').appendChild(response);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });