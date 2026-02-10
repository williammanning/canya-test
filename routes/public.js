import express from 'express';
const router = express.Router();
import { readData } from '../middleware/db.js';

// Get all public services
router.get('/services', (req, res) => {
  const services = readData('services.json');
  res.json(services);
});

// Get all public links
router.get('/links', (req, res) => {
  const links = readData('links.json');
  res.json(links);
});

// Get all members
router.get('/members', (req, res) => {
  const members = readData('members.json');
  res.json(members);
});

export default router;
