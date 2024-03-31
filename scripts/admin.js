// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

// get db link from .env
const dbLink = process.env.DB_LINK;

// Function to replace element contents with strings from messages object
function replaceElementContents() {
  // Replace title
  document.getElementById('title').textContent = messages.adminTitle;
  // Don't need usagecount for admin page
  // document.getElementById('usageCount').innerText = messages.usageCount
  document.getElementById('logoutButton').textContent = messages.logout;
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', replaceElementContents);

// Insert table element with list of users and usage counts
async function insertUserTable() {
  try {
    // Fetch the user data from the server
    const response = await fetch(`${dbLink}/users`);
    const data = await response.json();

    // Get the table element
    const table = document.getElementById('userTable');

    // Add the table header row
    const headerRow = table.insertRow();
    const headerCell1 = headerRow.insertCell();
    headerCell1.textContent = 'User ID';
    const headerCell2 = headerRow.insertCell();
    headerCell2.textContent = 'Usage Count';

    // Add a row for each user
    data.forEach(user => {
      const row = table.insertRow();
      const cell1 = row.insertCell();
      cell1.textContent = user.userId;
      const cell2 = row.insertCell();
      cell2.textContent = user.usageCount;
    });
  } catch (error) {
    console.error('Error inserting user table:', error);
  }
}