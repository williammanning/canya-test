// Gemini AI Chatbot Integration

function initChatbot() {
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  if (!chatInput || !chatSend || !chatMessages) {
    return;
  }

  addMessage('assistant', 'Hello! I\'m here to help answer your questions about Canya services and resources. How can I assist you today?');

  chatSend.addEventListener('click', handleSendMessage);

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

  addMessage('user', message);
  chatInput.value = '';

  const loadingId = addMessage('assistant', 'Thinking...');

  try {
    const response = await sendToServer(message);
    removeMessage(loadingId);
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
    headers: { 'Content-Type': 'application/json' },
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}
