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

function adjustMainContentHeight() {
  const headerHeight = document.querySelector('header').offsetHeight;
  const footerHeight = document.querySelector('footer').offsetHeight;
  document.getElementById('main-content').style.height = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
}

// Call the function initially and on window resize
window.addEventListener('resize', adjustMainContentHeight);
adjustMainContentHeight();

document.getElementById('submitButton').addEventListener('click', function() {
  // Get the user input
  let text = document.getElementById('userInput').value;

  // Clear the text input box
  document.getElementById('userInput').value = '';

  // Create a new chat bubble for the user input
  let userBubble = document.createElement('div');
  userBubble.classList.add('chat-bubble', 'user-bubble');
  userBubble.textContent = text;

  // Append the user bubble to the chatbox
  document.getElementById('chatbox').appendChild(userBubble);

  // Scroll to the bottom of the chatbox after sending the message
  document.getElementById('main-content').scrollTop = document.getElementById('main-content').scrollHeight;

  // Show loading indicator while waiting for the response
  let loadingBubble = document.createElement('div');
  loadingBubble.classList.add('chat-bubble', 'bot-bubble');
  loadingBubble.innerHTML = '<span class="loading-dots">.</span><span class="loading-dots">.</span><span class="loading-dots">.</span>';

  // Append the loading bubble to the chatbox
  document.getElementById('chatbox').appendChild(loadingBubble);

  // Data to be sent to the server
  let data = { text: text };

  // Send the user input to the server
  fetch(apiUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
      // Remove the loading indicator
      document.getElementById('chatbox').removeChild(loadingBubble);

      // Create a new chat bubble for the chatbot response
      let botBubble = document.createElement('div');
      botBubble.classList.add('chat-bubble', 'bot-bubble');
      botBubble.textContent = data.prediction;

      // Append the chatbot bubble to the chatbox
      document.getElementById('chatbox').appendChild(botBubble);

      // Scroll to the bottom of the chatbox after receiving and displaying the response
      document.getElementById('main-content').scrollTop = document.getElementById('main-content').scrollHeight;
  })
  .catch(error => {
      // Remove the loading indicator on error
      document.getElementById('chatbox').removeChild(loadingBubble);
      console.error('Error:', error);
  });
});
