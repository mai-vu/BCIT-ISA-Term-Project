// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

const apiUrl = "http://server2:3000/query";

// Function to replace element contents with strings from messages object
function replaceElementContents() {
    // Replace title
    // document.getElementById('title').textContent = messages.title;
    // document.getElementById('searchHeader').textContent = messages.searchHeader;
    // document.getElementById('insertRows').textContent = messages.insertRows;
    // document.getElementById('submitQuery').textContent = messages.submitQuery;
    document.getElementById('usageCount').innerText = messages.usageCount

}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', replaceElementContents);

// Function to fetch and update the usage count
async function updateUsageCount() {
    try {
        // Fetch the usage count from the server
        const response = await fetch('users/usagecount');
        const data = await response.json();
        
        // Update the usage count in the span element
        document.getElementById('usageCount').innerText += data.apiCalls;
    } catch (error) {
        console.error('Error updating usage count:', error);
    }
}

// Call the function to update the usage count initially
updateUsageCount();

function insertRows() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl + "/query", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("response").innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

function executeQuery() {
    const query = document.getElementById("query").value;
    const method = query.toLowerCase().includes("insert") ? "POST" : "GET";
    const xhr = new XMLHttpRequest();
    xhr.open(method, apiUrl + "query", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("response").innerHTML = xhr.responseText;
        }
    };
    xhr.send(JSON.stringify({ query: query }));
}
