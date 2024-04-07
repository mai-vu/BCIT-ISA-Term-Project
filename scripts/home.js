// Import the messages object from lang/en/strings.js
import { messages } from '../lang/en/strings.js';

const API_LIMIT = 20;
const apiKeyUrlConsumption = messages.apiKeyUrlConsumption;
const apiUrlConvo = messages.apiUrlConvo;


// Function to replace element contents with strings from messages object
function replaceElementContents() {
  // Replace title
  document.getElementById('title').textContent = messages.home;
  document.getElementById('usageCount').innerText = messages.usageCount
  document.getElementById('logoutButton').textContent = messages.logout;
  document.getElementById('submitButton').textContent = messages.submitButton;
  document.getElementById('deleteButton').textContent = messages.deleteButton;
}

// Call the function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', replaceElementContents);


function adjustMainContentHeight() {
  const headerHeight = document.querySelector('header').offsetHeight;
  const footerHeight = document.querySelector('footer').offsetHeight;
  document.getElementById('main-content').style.height = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;
}

// Call the function initially and on window resize
window.addEventListener('resize', adjustMainContentHeight);
adjustMainContentHeight();

// Function to display a chat bubble for the message
function displayMessage(text, byUser) {
  let bubble = document.createElement('div');
  bubble.classList.add('chat-bubble');

  if (byUser) {
    bubble.classList.add('user-bubble');
  } else  {
    bubble.classList.add('bot-bubble');
  }

  bubble.textContent = text;

  // Append the chat bubble to the chatbox
  document.getElementById('chatbox').appendChild(bubble);

  // Scroll to the bottom of the chatbox after displaying the message
  document.getElementById('main-content').scrollTop = document.getElementById('main-content').scrollHeight;
}


//get api key
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
    }
  } catch (error) {
    console.error('Error getting API key:', error);
  }
}
const apiKey = await getApiKey();

async function getUserRole() {
  try {
    const response = await fetch('/users/role', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return data.role;
    }
  } catch (error) {
    console.error('Error getting user role:', error);
  }
}
const userRole = await getUserRole();

let usageCount = 0; // Define global usageCount variable

async function getUsageCount() {
  try {
    const response = await fetch(apiKeyUrlConsumption, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      // Check if the response contains the x-key-warning header
      const xKeyWarning = response.headers.get('x-key-warning');
      if (xKeyWarning) {
        displayWarningIfNeeded(xKeyWarning);
      }
      if (data && userRole === 'user') {
        usageCount = data.usage; // Update global usageCount
        updateUsageDisplay();
      } else if (data && data.stats && userRole === 'admin') {
        // Iterate through the stats array and display count for the admin
        data.stats.forEach(stat => {
          if (stat['api-key'] === apiKey) {
            usageCount = stat.usage; // Update global usageCount
            updateUsageDisplay();
          } else {
            console.log('API Key not matched:');
          }
        });
      }
    }
  } catch (error) {
    console.error('Error getting usage count:', error);
  }
}

function updateUsageDisplay() {
  // Update the UI to display the usage count
  document.getElementById('usageCount').textContent = messages.usageCount + usageCount;
}

function displayWarningIfNeeded(warning) {
  // Remove any existing warning messages
  removeExistingWarnings();

  let warningDiv = document.createElement('div');
  warningDiv.classList.add('text-danger'); // Add text-danger class for styling

  // Set the warning message content
  warningDiv.textContent = warning;

  // Get the warning container element
  let warningContainer = document.getElementById('warningContainer');

  // Append the warning message to the warning container
  warningContainer.appendChild(warningDiv);
  
}

function removeExistingWarnings() {
  // Remove any existing warning messages
  let existingWarnings = document.querySelectorAll('#warningContainer .text-danger');
  existingWarnings.forEach(warning => {
    warning.remove();
  });
}

// Call getUsageCount function to fetch and display the usage count
getUsageCount();

async function getConvoExisted() {
  try {
    const response = await fetch('/users/convoExisted', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();

      return data.convoExisted;
    }
  } catch (error) {
    console.error(error);
  }
}
let convoExisted = await getConvoExisted();


async function updateConvoExisted(convoExisted) {
  try {
    const response = await fetch('/users/convoExisted', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ convoExisted }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.convoExisted;
    } else {
      // Handle non-200 response status
      const errorMessage = await response.text();
      throw new Error(`Failed to update conversation existence: ${errorMessage}`);
    }
  } catch (error) {
    // Handle fetch or other errors
    console.error('Error updating conversation existence:', error);
    throw error; // Rethrow the error for the caller to handle
  }
}

// Function to check conversation existence and display conversation
async function checkConversationAndDisplay() {
  try {
    const response = await fetch(apiUrlConvo, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
    });

    if (response.status === 404 || response.status === 401) {
      if (convoExisted) {
        convoExisted = await updateConvoExisted(false); // Set convoExisted to false if conversation does not exist
      }
      return [];
    } else if (response.status === 200) {
      // Check if the response contains the x-key-warning header
      const xKeyWarning = response.headers.get('x-key-warning');
      if (xKeyWarning) {
        displayWarningIfNeeded(xKeyWarning);
      }

      const data = await response.json(); // Return the conversation messages
      if (data && data.convoMessage) {
        if (!convoExisted) {
          convoExisted = await updateConvoExisted(true); // Set convoExisted to true if conversation exists
        }
        // Display conversation messages
        data.convoMessage.forEach(message => {
          let text = message.text;
          if (!message.byUser) {
            text = filterResponse(text);
          } 
          displayMessage(text, message.byUser); // Assuming message object has 'text' and 'sender' properties
        });
      }
      usageCount++; // Increment the usage count
      updateUsageDisplay(); // Update the usage display without increasing GET usage consumption
    }
  } catch (error) {
    console.error('Error checking conversation existence:', error);
  }
}

// Call the function to check conversation existence and display messages
if (convoExisted) {
  checkConversationAndDisplay();
  document.getElementById('deleteButton').disabled = false; // Enable the delete button
}

// Add event listener to delete button
document.getElementById('deleteButton').addEventListener('click', async function () {
  try {
    if (convoExisted) {
      // Send a DELETE request to delete the conversation
      const response = await fetch(apiUrlConvo, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
      });

      if (response.ok) {
        // Check if the response contains the x-key-warning header
        const xKeyWarning = response.headers.get('x-key-warning');
        if (xKeyWarning) {
          displayWarningIfNeeded(xKeyWarning);
        }

        // Update the conversation existence status
        convoExisted = await updateConvoExisted(false);
        // Clear the chatbox
        document.getElementById('chatbox').innerHTML = '';
        document.getElementById('deleteButton').disabled = true; // Disable the delete button
        usageCount++; // Increment the usage count
        updateUsageDisplay(); // Update the usage display without increasing GET usage consumption
      } else {
        // Handle non-200 response status
        const errorMessage = await response.text();
        throw new Error(`Failed to delete conversation: ${errorMessage}`);
      }
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
});



// Function to handle form submission
async function handleSubmit() {
  //disable the submit button and delete button while waiting for the response
  document.getElementById('submitButton').disabled = true;
  document.getElementById('deleteButton').disabled = true;

  // Get the user input
  let text = document.getElementById('userInput').value;

  // Clear the text input box
  document.getElementById('userInput').value = '';

  displayMessage(text, true); // Display the user message

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

  // Determine the HTTP method based on conversation existence
  let httpMethod = convoExisted ? 'PATCH' : 'POST';

  console.log('HTTP Method:', httpMethod);

  try {
    // Send the user input to the server
    const response = await fetch(apiUrlConvo, {
      method: httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to get response');
    } else {
      // Check if the response contains the x-key-warning header
      const xKeyWarning = response.headers.get('x-key-warning');
      if (xKeyWarning) {
        displayWarningIfNeeded(xKeyWarning);
      }

      if (!convoExisted) {
        convoExisted = await updateConvoExisted(true);
        document.getElementById('deleteButton').disabled = false; // Enable the delete button
      }
      usageCount++; // Increment the usage count
      updateUsageDisplay(); // Update the usage display without increasing GET usage consumption
    }

    // Remove the loading indicator
    document.getElementById('chatbox').removeChild(loadingBubble);

    // Process the response and filter repetitive text
    let filteredResponse = filterResponse(responseData.messages[1].text);

    if (!filteredResponse) {
      filteredResponse = messages.defaultResponse;
    }

    // Check if the filtered response is not empty
    if (filteredResponse) {
      // // Create a new chat bubble for the chatbot response
      displayMessage(filteredResponse, false); // Display the chatbot response

      // enable the submit button and delete button after the response is displayed
      document.getElementById('submitButton').disabled = false;
      document.getElementById('deleteButton').disabled = false;

    }
  } catch (error) {
    // Remove the loading indicator on error if it's still present
    if (loadingBubble) {
      document.getElementById('chatbox').removeChild(loadingBubble);
    }
    displayMessage(messages.defaultResponse, false);
  }
}

// Add event listener to submit button
document.getElementById('submitButton').addEventListener('click', function () {
  handleSubmit();
});

function filterResponse(responseText) {
  try {
    let sentences = responseText;

    // Split the response into sentences, discarding text before "[SEP]"
    if (responseText.includes('[SEP]')) {
      sentences = responseText.split('[SEP]').slice(1).join('[SEP]');
    }

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
      let punctuation = punctuationArray ? punctuationArray[i] : ''; // Handle case when punctuationArray is null
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
        uniqueSentences.push(sentence + punctuation); // Include original punctuation
      }
    }

    // Rejoin the unique sentences
    let filteredResponse = uniqueSentences.join(' ');

    return filteredResponse;
  } catch (error) {
    console.error('Error in filterResponse:', error);
    return responseText; // Return the original response text in case of an error
  }
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
