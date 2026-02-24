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

  // Test AI Config connection
  if (window.chatbotAIConfig) {
    console.log('✅ Chatbot AI Config is active:', window.chatbotAIConfig);
    // Optionally show config info in chat
    const configInfo = `Using model: ${window.chatbotAIConfig.model} (Temperature: ${window.chatbotAIConfig.temperature})`;
    console.log('🤖 ' + configInfo);
  } else {
    console.warn('⚠️ Chatbot AI Config not yet loaded, using defaults');
  }

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
  // Get AI config from LaunchDarkly (set by ld.js)
  const aiConfig = window.chatbotAIConfig || null;

  if (aiConfig && aiConfig.enabled === false) {
    return 'The AI assistant is currently disabled by configuration. Please try again later.';
  }
  
  // Test: Log AI config being sent
  console.log('📤 Sending message to server with AI config:', aiConfig);
  
  // Track chatbot usage in LaunchDarkly
  if (window.ldclient) {
    window.ldclient.track('chatbot-message-sent', {
      messageLength: userMessage.length,
      model: aiConfig?.model || 'default',
      temperature: aiConfig?.temperature || 0.7,
      configProvided: !!aiConfig
    });
    window.ldclient.flush();
  }
  
  const response = await fetch('/api/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      message: userMessage,
      aiConfig: aiConfig
    })
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.response) {
    // Track successful response
    if (window.ldclient) {
      window.ldclient.track('chatbot-response-received', {
        responseLength: data.response.length,
        model: aiConfig?.model || 'default'
      });
      window.ldclient.flush();
    }
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
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';

  const label = document.createElement('strong');
  label.textContent = role === 'user' ? 'You:' : 'AI Assistant:';
  messageContent.appendChild(label);

  const messageBody = document.createElement('div');
  messageBody.className = 'message-body';

  if (role === 'assistant') {
    appendFormattedAssistantContent(messageBody, content);
  } else {
    const paragraph = document.createElement('p');
    paragraph.textContent = content;
    messageBody.appendChild(paragraph);
  }

  messageContent.appendChild(messageBody);
  messageDiv.appendChild(messageContent);
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageId;
}

function appendFormattedAssistantContent(container, content) {
  const lines = String(content || '').replace(/\r/g, '').split('\n');
  let index = 0;

  while (index < lines.length) {
    const currentLine = lines[index].trim();

    if (!currentLine) {
      index += 1;
      continue;
    }

    if (/^[-*•]\s+/.test(currentLine)) {
      const bulletList = document.createElement('ul');
      while (index < lines.length && /^[-*•]\s+/.test(lines[index].trim())) {
        const item = document.createElement('li');
        item.textContent = lines[index].trim().replace(/^[-*•]\s+/, '');
        bulletList.appendChild(item);
        index += 1;
      }
      container.appendChild(bulletList);
      continue;
    }

    if (/^\d+\.\s+/.test(currentLine)) {
      const numberedList = document.createElement('ol');
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        const item = document.createElement('li');
        item.textContent = lines[index].trim().replace(/^\d+\.\s+/, '');
        numberedList.appendChild(item);
        index += 1;
      }
      container.appendChild(numberedList);
      continue;
    }

    const paragraph = document.createElement('p');
    paragraph.textContent = lines[index].trim();
    container.appendChild(paragraph);
    index += 1;
  }
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
