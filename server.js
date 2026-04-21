import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import publicRoutes from './routes/public.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}


// Initialize data files if they don't exist
const initializeDataFiles = () => {
  const defaultUsers = [
    {
      id: '1',
      email: 'admin@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS',
      name: 'Administrator',
      role: 'admin'
    },
    {
      id: '2',
      email: 'sjohnson@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS',
      name: 'Sarah Johnson',
      role: 'user'
    },
    {
      id: '3',
      email: 'mwilliams@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS',
      name: 'Marcus Williams',
      role: 'user'
    },
    {
      id: '4',
      email: 'erodriguez@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS',
      name: 'Elena Rodriguez',
      role: 'user'
    }
  ];

  const defaultLinks = [
    {
      id: '1',
      name: 'Greenpeace',
      url: 'https://www.greenpeace.org',
      description: 'Global environmental organization fighting climate change'
    },
    {
      id: '2',
      name: 'Black Lives Matter',
      url: 'https://blacklivesmatter.com',
      description: 'Movement against police violence and systemic racism'
    }
  ];

  const defaultServices = [
    {
      id: '1',
      name: 'Environmental Conservation',
      description: 'Organizations working to protect our planet and natural resources',
      icon: '🌍'
    },
    {
      id: '2',
      name: 'Social Justice',
      description: 'Movements dedicated to creating a more equitable society',
      icon: '✊'
    }
  ];

  const defaultMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Founder & Director',
      group: 'Leadership',
      bio: 'Community advocate with 10+ years of experience in nonprofit work',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: '2',
      name: 'Marcus Williams',
      role: 'Operations Lead',
      group: 'Operations',
      bio: 'Passionate about connecting communities with resources',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      role: 'Partnerships Coordinator',
      group: 'Partnerships',
      bio: 'Building bridges between service organizations and communities',
      image: 'https://via.placeholder.com/150'
    }
  ];

  const files = [
    { name: 'users.json', data: defaultUsers },
    { name: 'links.json', data: defaultLinks },
    { name: 'services.json', data: defaultServices },
    { name: 'members.json', data: defaultMembers }
  ];

  files.forEach(file => {
    const filePath = path.join(dataDir, file.name);
    if (!fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
      } catch (err) {
        console.error(`Error initializing ${file.name}:`, err);
      }
    }
  });
};

initializeDataFiles();

const ensureDefaultUsersInDatabase = () => {
  const usersPath = path.join(dataDir, 'users.json');
  if (!fs.existsSync(usersPath)) {
    return;
  }

  const defaultUsers = [
    {
      id: '1',
      email: 'admin@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS',
      name: 'Administrator',
      role: 'admin'
    },
    {
      id: '2',
      email: 'sjohnson@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS',
      name: 'Sarah Johnson',
      role: 'user'
    },
    {
      id: '3',
      email: 'mwilliams@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS',
      name: 'Marcus Williams',
      role: 'user'
    },
    {
      id: '4',
      email: 'erodriguez@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS',
      name: 'Elena Rodriguez',
      role: 'user'
    }
  ];

  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch (err) {
    console.error('Unable to sync default users:', err);
    return;
  }

  let usersUpdated = false;
  for (const defaultUser of defaultUsers) {
    const exists = users.some(user => user.email === defaultUser.email);
    if (!exists) {
      users.push(defaultUser);
      usersUpdated = true;
    }
  }

  if (usersUpdated) {
    try {
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    } catch (err) {
      console.error('Error saving default users:', err);
    }
  }
};

ensureDefaultUsersInDatabase();

const migrateMemberCredentialsToUsers = () => {
  const usersPath = path.join(dataDir, 'users.json');
  const membersPath = path.join(dataDir, 'members.json');

  if (!fs.existsSync(usersPath) || !fs.existsSync(membersPath)) {
    return;
  }

  let users = [];
  let members = [];

  try {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    members = JSON.parse(fs.readFileSync(membersPath, 'utf8'));
  } catch (err) {
    console.error('Unable to migrate member credentials:', err);
    return;
  }

  let usersUpdated = false;
  let membersUpdated = false;

  members = members.map(member => {
    if (member.email && member.password) {
      const existingUser = users.find(u => u.email === member.email);
      if (!existingUser) {
        users.push({
          id: member.id || crypto.randomUUID(),
          email: member.email,
          password: member.password,
          name: member.name || member.email,
          role: 'user'
        });
        usersUpdated = true;
      }

      const sanitizedMember = { ...member };
      delete sanitizedMember.email;
      delete sanitizedMember.password;
      membersUpdated = true;
      return sanitizedMember;
    }

    return member;
  });

  if (usersUpdated) {
    try {
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    } catch (err) {
      console.error('Error saving migrated users:', err);
    }
  }

  if (membersUpdated) {
    try {
      fs.writeFileSync(membersPath, JSON.stringify(members, null, 2));
    } catch (err) {
      console.error('Error saving migrated members:', err);
    }
  }
};

migrateMemberCredentialsToUsers();

// Routes
app.use('/api/auth', authRoutes.default || authRoutes);
app.use('/api', apiRoutes.default || apiRoutes);
app.use('/api/public', publicRoutes.default || publicRoutes);

// Serve HTML pages
const pagesDir = path.join(__dirname, 'public', 'pages');
const indexPath = path.join(__dirname, 'public', 'index.html');

app.get('/', (req, res) => {
  res.sendFile(indexPath);
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(pagesDir, 'services.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(pagesDir, 'about.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(pagesDir, 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(pagesDir, 'admin.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(pagesDir, 'profile.html'));
});


// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Canya server is running on http://localhost:${PORT}`);
  console.log(`Admin account: admin@canya.com`);
});
