// Import the messages object from lang/en/strings.js
import { messages } from './lang/en/strings.js';

const apiUrl = "http://server2:3000/query";

// Function to replace element contents with strings from messages object
function replaceElementContents() {
    // Replace title
    document.getElementById('title').textContent = messages.title;
    document.getElementById('searchHeader').textContent = messages.searchHeader;
    document.getElementById('insertRows').textContent = messages.insertRows;
    document.getElementById('submitQuery').textContent = messages.submitQuery;
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', replaceElementContents);

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

console.log("index.js loaded.");