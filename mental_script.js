// mental_script.js

// Global array to store conversation history
let conversationHistory = [];

// Your Gemini API key
const apiKey = 'AIzaSyBzeZ71NFfnr5WKeNtLoKh0nT1sty3E8Hk';

// Get DOM elements
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

// Function to add a user message to the chat and conversation history
function addUserMessage(message) {
    // Create message container for user
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'user');

    // Create avatar element for user
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.innerHTML = `<i class="fas fa-user"></i>`;

    // Create message content container
    const messageContentDiv = document.createElement('div');
    messageContentDiv.classList.add('message-content');
    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('message-bubble');
    bubbleDiv.textContent = message;

    // Create a timestamp element
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    timeDiv.textContent = new Date().toLocaleTimeString();

    // Append message parts together
    messageContentDiv.appendChild(bubbleDiv);
    messageContentDiv.appendChild(timeDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(messageContentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll chat to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save message in conversation history
    conversationHistory.push({
        sender: 'user',
        message: message,
        timestamp: new Date().toISOString()
    });
}

// Function to add a bot message to the chat and conversation history
function addBotMessage(message) {
    // Create message container for bot
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot');

    // Create avatar element for bot
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.innerHTML = `<i class="fas fa-robot"></i>`;

    // Create message content container
    const messageContentDiv = document.createElement('div');
    messageContentDiv.classList.add('message-content');
    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('message-bubble');
    bubbleDiv.textContent = message;

    // Create a timestamp element
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    timeDiv.textContent = new Date().toLocaleTimeString();

    // Append message parts together
    messageContentDiv.appendChild(bubbleDiv);
    messageContentDiv.appendChild(timeDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(messageContentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll chat to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save message in conversation history
    conversationHistory.push({
        sender: 'bot',
        message: message,
        timestamp: new Date().toISOString()
    });
}

// Function to call the Gemini API using fetch
async function callGeminiAPI(promptText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: promptText
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Assuming the API returns candidates with an "output" field
        console.log(data.candidates[0]);
        
        const generatedText = data.candidates[0].content.parts[0].text;
        return generatedText;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "I'm having trouble processing your request right now. Please try again later.";
    }
}

// Async function to generate the bot response based on conversation history
async function generateBotResponse() {
    // Build the prompt instructions
    const promptInstructions = `You are RHUNKS, an intelligent mental health assistant designed to support and provide guidance for users discussing their feelings and mental health challenges. Your goal is to understand what may be affecting the user's mental state based on the ongoing conversation.

You have access to a JSON file that contains the entire conversation history between you and the user. Each entry in the JSON file includes a "sender" (either "user" or "bot"), a "message" field, and a timestamp.

Your instructions are as follows:
1. Contextual Analysis: 
   - Before each response, read and analyze the JSON conversation history.  
   - Identify key emotional indicators, recurring themes, and any signs of distress or patterns that might suggest mental health challenges.

2. Ongoing Engagement:
   - If the conversation contains fewer than 7 messages from the user, continue to ask open-ended and clarifying questions. Encourage the user to elaborate on their feelings and experiences.  
   - Your responses should be empathetic, supportive, and structured to gently guide the conversation while building sufficient context.

3. Diagnosis Trigger:
   - Once the JSON history shows that the user has provided at least 7 messages, analyze all the user messages in detail.
   - If clear signs of mental distress, anxiety, depression, or other mental health issues are detected, provide a tentative diagnosis or insight.  
   - Ensure that any diagnostic response is accompanied by a disclaimer such as:  
     "I am not a licensed mental health professional, but based on our conversation, it might be helpful to consider speaking with a professional for further support."  
   - If the conversation does not yet provide enough evidence for a diagnosis, gently ask further questions to clarify and deepen your understanding.

4. Response Guidelines:
   - Maintain a compassionate tone in all responses.
   - Base your next response solely on the analysis of the JSON conversation history.
   - Ensure that any advice or recommendations are carefully worded to encourage the user to seek professional help if needed.

Using these instructions and the JSON conversation history as context, generate your next response. Return only the text response and nothing extra.`;

    // Build the complete prompt with conversation history
    const completePrompt = promptInstructions + "\n\nConversation History:\n" + JSON.stringify(conversationHistory, null, 2);

    // Call the Gemini API with the complete prompt
    const apiResponse = await callGeminiAPI(completePrompt);
    console.log(apiResponse);
    return apiResponse;
}

// Async function to handle the bot response
async function handleBotResponse() {
    const botResponse = await generateBotResponse();
    addBotMessage(botResponse);
}

// Event listener for the Enter key in the text area
userInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message !== '') {
            addUserMessage(message);
            userInput.value = '';
            // Wait 1 second before handling bot response
            setTimeout(() => {
                handleBotResponse();
            }, 1000);
        }
    }
});

// Event listener for the send button
sendButton.addEventListener('click', function () {
    const message = userInput.value.trim();
    if (message !== '') {
        addUserMessage(message);
        userInput.value = '';
        // Wait 1 second before handling bot response
        setTimeout(() => {
            handleBotResponse();
        }, 1000);
    }
});
