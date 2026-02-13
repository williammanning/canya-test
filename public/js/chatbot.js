// Gemini AI Chatbot Integration
// Using Gemini 3 Flash Preview model via server proxy

function initChatbot() {
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  if (!chatInput || !chatSend || !chatMessages) {
    return; // Elements not found, chatbot section may be hidden
  }

  // Add welcome message
  addMessage('assistant', 'Hello! I\'m here to help answer your questions about Canya services and resources. How can I assist you today?');

  // Handle send button click
  chatSend.addEventListener('click', handleSendMessage);

  // Handle Enter key press
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
}

async function handleSendMessage() {
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessage('user', message);
  chatInput.value = '';

  // Show loading indicator
  const loadingId = addMessage('assistant', 'Thinking...');

  try {
    // Send message to server endpoint
    const response = await sendToServer(message);
    
    // Remove loading message
    removeMessage(loadingId);
    
    // Add AI response
    addMessage('assistant', response);
  } catch (error) {
    console.error('Error communicating with chatbot:', error);
    removeMessage(loadingId);
    addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
  }
}

async function sendToServer(userMessage) {
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userMessage })
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.response) {
    return data.response;
  } else {
    throw new Error('Unexpected response format from server');
  }
}

function addMessage(role, content) {
  const chatMessages = document.getElementById('chat-messages');
  const messageId = `msg-${Date.now()}`;
  
  const messageDiv = document.createElement('div');
  messageDiv.id = messageId;
  messageDiv.className = `chat-message ${role}`;
  messageDiv.innerHTML = `
    <div class="message-content">
      <strong>${role === 'user' ? 'You' : 'AI Assistant'}:</strong>
      <p>${content}</p>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageId;
}

function removeMessage(messageId) {
  const message = document.getElementById(messageId);
  if (message) {
    message.remove();
  }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}

// Re-initialize when the chatbot section becomes visible (flag changes)
if (window.ldclient) {
  window.ldclient.on('change:enable-chatbot-for-help', (enabled) => {
    if (enabled) {
      setTimeout(initChatbot, 100); // Small delay to ensure DOM is updated
    }
  });
}
