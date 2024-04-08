// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

const endpointStatsUrl = "https://www.alexkong.xyz/proj/api/stats";
const apiUsageDataUrl = "https://www.alexkong.xyz/proj/api/consumption";

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

// Get API key
async function getApiKey() {
    try {
        const response = await fetch('/users/apikey', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            return data.apiKey;
        } else {
            console.error('Failed to get API key. Status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error getting API key:', error);
        return null;
    }
}
const apiKey = await getApiKey(); // Wait for the promise to resolve

// // function to get users
// async function getUsers() {
//     try {
//         const response = await fetch('/admin/users', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (response.status === 200) {
//             const data = await response.json();
//             return data;
//         } else {
//             console.error('Failed to get users. Status:', response.status);
//             return null;
//         }
//     } catch (error) {
//         console.error('Error getting users:', error);
//         return null;
//     }
// }

async function getApiUsageData() {
    try {
        const response = await fetch(apiUsageDataUrl, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            return data.stats;
        } else {
            console.error('Failed to get API usage data. Status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error getting API usage data:', error);
        return null;
    }
}

// Call the function to initiate the request
const usageData = await getApiUsageData();
console.log('API Usage Data:', usageData);

// const users = await getUsers();
// console.log('Users:', users);

// Function to calculate total usage for each endpoint
async function getEndpointUsage() {
    try {
        const response = await fetch(endpointStatsUrl, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            // Extract entries from the 'stats' array
            const entries = data.stats.map(stat => ({
                endpoint: stat.endpoint,
                method: stat.method,
                count: stat.count
            }));
            return entries;
        } else {
            console.error('Failed to get API usage data. Status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error getting API usage data:', error);
        return null;
    }
}


async function populateEndpointTable() {
    const endpointList = document.querySelector('#endpointTable tbody');

    // Fetch endpoint usage data from the server
    const endpointData = await getEndpointUsage();
    console.log('Endpoint Data:', endpointData);

    // Clear existing table rows
    endpointList.innerHTML = '';

    // Iterate over each endpoint and create table rows
    endpointData.forEach(endpoint => {
        const row = `
            <tr>
                <td>${endpoint.method}</td>
                <td>${endpoint.endpoint}</td>
                <td>${endpoint.count}</td>
            </tr>
        `;
        endpointList.innerHTML += row;
    });
}

// Function to populate the table with users data
async function populateUserTable() {
    const usersList = document.querySelector('#userTable tbody');

    // Clear existing table rows
    usersList.innerHTML = '';

    // Iterate over each user and create table rows
    usageData.forEach(user => {
        const row = `
            <tr>
                <td>${user.email}</td>
                <td>${user['api-key']}</td>
                <td>${user.usage || 0}</td>
            </tr>
        `;
        usersList.innerHTML += row;
    });
}

populateEndpointTable();
populateUserTable();
