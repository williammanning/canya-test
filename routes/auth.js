import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readData } from '../middleware/db.js';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) throw new Error('SECRET_KEY environment variable is required');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const users = readData('users.json');
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

const verifyTokenHandler = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
};

router.get('/verify', verifyTokenHandler);
router.post('/verify', verifyTokenHandler);

export default router;
