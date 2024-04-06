// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

const apiUrl = "https://www.alexkong.xyz/proj/predict";

let apiKey = null;
async function getApiKey() {
  try {
    const response = await fetch('users/apiKey');
    const data = await response.json();
    return data.apiKey;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  } 
}

getApiKey().then((key) => {
  apiKey = key;
});


// Function to replace element contents with strings from messages object
function replaceElementContents() {
  // Replace title
  document.getElementById('title').textContent = messages.home;
  document.getElementById('usageCount').innerText = messages.usageCount
  document.getElementById('logoutButton').textContent = messages.logout;
  document.getElementById('submitButton').textContent = messages.submitButton;
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

document.getElementById('submitButton').addEventListener('click', function () {
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
  let data = {
    text: text
  };

  // Send the user input to the server
  let submitButton = document.getElementById('submitButton');
  submitButton.disabled = true; // Disable the submit button while waiting for the response
  fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      // Remove the loading indicator
      document.getElementById('chatbox').removeChild(loadingBubble);

      // Process the response and filter repetitive text
      let filteredResponse = filterResponse(data.prediction);

      if (!filteredResponse) {
        filteredResponse = "I'm sorry, I didn't understand that. Can you please rephrase?";
      }

      // Check if the filtered response is not empty
      if (filteredResponse) {
        // Create a new chat bubble for the chatbot response
        let botBubble = document.createElement('div');
        botBubble.classList.add('chat-bubble', 'bot-bubble');
        botBubble.textContent = filteredResponse;

        // Append the chatbot bubble to the chatbox
        document.getElementById('chatbox').appendChild(botBubble);

        // Scroll to the bottom of the chatbox after receiving and displaying the response
        document.getElementById('main-content').scrollTop = document.getElementById('main-content').scrollHeight;
      }
    })
    .catch(error => {
      // Remove the loading indicator on error
      document.getElementById('chatbox').removeChild(loadingBubble);
      console.error('Error:', error);
    })
});

// Function to filter the response and remove repetitive text
function filterResponse(responseText) {

  // Split the response into sentences, discarding text before "[SEP]"
  let sentences = responseText.split('[SEP]').slice(1).join('[SEP]');

  // Split sentences by ".", ",", "?", and "!"
  let sentenceArray = sentences.split(/[.,?!]+/);

  // Remove empty strings and trim each sentence
  sentenceArray = sentenceArray.filter(sentence => sentence.trim() !== '');

  // Keep track of the punctuation marks for each sentence
  let punctuationArray = sentences.match(/[.,?!]+/g);

  // Remove duplicates while keeping track of original punctuation
  let uniqueSentences = [];
  let uniqueSentenceSet = new Set(); // Using a set to track unique sentences
  for (let i = 0; i < sentenceArray.length; i++) {
    let sentence = sentenceArray[i].trim();
    let punctuation = punctuationArray[i];
    if (i === sentenceArray.length - 1) {
      // Check if the last sentence ends with ".", ",", "?", or "!"
      let lastChar = sentence.charAt(sentence.length - 1);
      if (!['.', ',', '?', '!'].includes(lastChar)) {
        continue; // Skip adding this sentence if it doesn't end with punctuation
      }
    }
    // Add the sentence to the unique set if it's not already there
    if (!uniqueSentenceSet.has(sentence)) {
      uniqueSentenceSet.add(sentence);
      uniqueSentences.push(sentence + (punctuation ? punctuation : '')); // Include original punctuation
    }
  }

  // Rejoin the unique sentences
  let filteredResponse = uniqueSentences.join(' ');

  return filteredResponse;
}

// disable the submit button if the input field is empty
document.getElementById('userInput').addEventListener('input', function () {
  let submitButton = document.getElementById('submitButton');
  if (this.value.trim() === '') {
    submitButton.disabled = true;
  } else {
    submitButton.disabled = false;
  }
});
