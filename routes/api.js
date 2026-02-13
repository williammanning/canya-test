import express from 'express';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { readData, writeData } from '../middleware/db.js';
import { verifyToken } from '../middleware/auth.js';

// User Management Routes
router.get('/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const users = readData('users.json');
  res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
});

router.post('/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  const users = readData('users.json');
  
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: uuidv4(),
    email,
    password: bcrypt.hashSync(password, 10),
    name,
    role: role || 'user'
  };

  users.push(newUser);
  writeData('users.json', users);

  res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
});

router.put('/users/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { email, password, name, role } = req.body;

  let users = readData('users.json');
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (email) users[userIndex].email = email;
  if (password) users[userIndex].password = bcrypt.hashSync(password, 10);
  if (name) users[userIndex].name = name;
  if (role) users[userIndex].role = role;

  writeData('users.json', users);
  res.json({ id: users[userIndex].id, email: users[userIndex].email, name: users[userIndex].name, role: users[userIndex].role });
});

router.delete('/users/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  let users = readData('users.json');
  
  users = users.filter(u => u.id !== id);
  writeData('users.json', users);

  res.json({ message: 'User deleted' });
});

// Link Management Routes
router.get('/links', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const links = readData('links.json');
  res.json(links);
});

router.post('/links', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { name, url, description } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL required' });
  }

  const links = readData('links.json');
  const newLink = {
    id: uuidv4(),
    name,
    url,
    description: description || ''
  };

  links.push(newLink);
  writeData('links.json', links);

  res.status(201).json(newLink);
});

router.put('/links/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { name, url, description } = req.body;

  let links = readData('links.json');
  const linkIndex = links.findIndex(l => l.id === id);

  if (linkIndex === -1) {
    return res.status(404).json({ error: 'Link not found' });
  }

  if (name) links[linkIndex].name = name;
  if (url) links[linkIndex].url = url;
  if (description !== undefined) links[linkIndex].description = description;

  writeData('links.json', links);
  res.json(links[linkIndex]);
});

router.delete('/links/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  let links = readData('links.json');
  
  links = links.filter(l => l.id !== id);
  writeData('links.json', links);

  res.json({ message: 'Link deleted' });
});

// Service Management Routes
router.get('/services', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const services = readData('services.json');
  res.json(services);
});

router.post('/services', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { name, description, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Service name required' });
  }

  const services = readData('services.json');
  const newService = {
    id: uuidv4(),
    name,
    description: description || '',
    icon: icon || '🔗'
  };

  services.push(newService);
  writeData('services.json', services);

  res.status(201).json(newService);
});

router.put('/services/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { name, description, icon } = req.body;

  let services = readData('services.json');
  const serviceIndex = services.findIndex(s => s.id === id);

  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }

  if (name) services[serviceIndex].name = name;
  if (description !== undefined) services[serviceIndex].description = description;
  if (icon) services[serviceIndex].icon = icon;

  writeData('services.json', services);
  res.json(services[serviceIndex]);
});

router.delete('/services/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  let services = readData('services.json');
  
  services = services.filter(s => s.id !== id);
  writeData('services.json', services);

  res.json({ message: 'Service deleted' });
});

// Chatbot endpoint - proxy to Gemini API
router.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are a helpful assistant for Canya, a community services and resources platform. Help users with questions about community services, environmental conservation, social justice, and community development. Here's the user's question: ${message}`
          }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return res.status(500).json({ error: 'Failed to get response from AI' });
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      res.json({ response: aiResponse });
    } else {
      res.status(500).json({ error: 'Unexpected response format from AI' });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
