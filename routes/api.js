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

export default router;
