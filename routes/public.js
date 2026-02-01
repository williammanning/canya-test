const express = require('express');
const router = express.Router();
const { readData } = require('../middleware/db');

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

module.exports = router;
