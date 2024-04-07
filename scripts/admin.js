// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

// Hardcode the DB_URL for now, or retrieve it from a different source
const dbUrl = "mongodb+srv://isa:nsk1BTC6XDC2AFfe@isa.aobezkp.mongodb.net/?retryWrites=true&w=majority&appName=isa";

// Function to replace element contents with strings from messages object
function replaceElementContents() {
    // Replace title
    document.getElementById('title').textContent = messages.adminTitle;
    document.getElementById('logoutButton').textContent = messages.logout;
    document.getElementById('tableHeaderMethod').textContent = messages.tableHeaderMethod;
    document.getElementById('tableHeaderEndpoint').textContent = messages.tableHeaderEndpoint;
    document.getElementById('tableHeaderRequests').textContent = messages.tableHeaderRequests;
    document.getElementById('tableHeaderEmail').textContent = messages.tableHeaderEmail;
    document.getElementById('tableHeaderApiKey').textContent = messages.tableHeaderApiKey;
    document.getElementById('tableHeaderUsageCount').textContent = messages.tableHeaderUsageCount;
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    replaceElementContents();
});

// Function to fetch API usage data
async function fetchApiUsageData() {
    try {
        const response = await fetch('/admin/api-usage');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching API usage data:', error);
        return [];
    }
}

// Function to fetch users data
async function fetchUsersData() {
    try {
        const response = await fetch('/admin/users');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users data:', error);
        return [];
    }
}

// Function to populate the table with users data
async function populateUserTable() {
    const usersList = document.querySelector('#userTable tbody');

    // Fetch users data from the server
    const usersData = await fetchUsersData();

    // Clear existing table rows
    usersList.innerHTML = '';

    // Iterate over each user and create table rows
    usersData.forEach(user => {
        const row = `
            <tr>
                <td>${user.email}</td>
                <td>${user['api-key']}</td>
                <td>${user.role}</td>
            </tr>
        `;
        usersList.innerHTML += row;
    });
}

// Call populateUserTable() when the page loads
window.onload = populateUserTable;


// Call populateUserTable() when the page loads
window.onload = populateUserTable;
