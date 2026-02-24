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
import dotenv from 'dotenv';
import * as LaunchDarkly from '@launchdarkly/node-server-sdk';


dotenv.config();
const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);

client.once('ready', function () {
  // For onboarding purposes only we flush events as soon as
  // possible so we quickly detect your connection.
  // You don't have to do this in practice because events are automatically flushed.
  client.flush();
  console.log('SDK successfully initialized!');
});

client.on('initialized', () => {
  // initialization succeeded, flag values are now available
  const flagValue = client.variation('featured-links-frame', true);
  // etc.
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FEATURED_LINKS_FLAG_KEY = 'featured-links-frame';

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
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS', // password: admin123
      name: 'Administrator',
      role: 'admin'
    },
    {
      id: '2',
      email: 'sjohnson@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS', // password: admin123
      name: 'Sarah Johnson',
      role: 'user'
    },
    {
      id: '3',
      email: 'mwilliams@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS', // password: admin123
      name: 'Marcus Williams',
      role: 'user'
    },
    {
      id: '4',
      email: 'erodriguez@canya.com',
      password: '$2a$10$2ZBeAkiYGhn8RKQAUpSc1.2MpiOdhJxau.hBhJcT3IjdAxO9pcvQS', // password: admin123
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
      fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
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
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
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
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }

  if (membersUpdated) {
    fs.writeFileSync(membersPath, JSON.stringify(members, null, 2));
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
let indexHtmlCache = null;

const stripFlaggedBlock = (html, flagKey) => {
  const startMarker = `<!-- ld:${flagKey}:start -->`;
  const endMarker = `<!-- ld:${flagKey}:end -->`;
  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return html.slice(0, startIndex) + html.slice(endIndex + endMarker.length);
  }

  const sectionRegex = new RegExp(`<section[^>]*id="${flagKey}"[\\s\\S]*?<\\/section>`, 'm');
  return html.replace(sectionRegex, '');
};

const getOrSetUserKey = (req, res) => {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});

  if (cookies.ld_user_key) {
    return cookies.ld_user_key;
  }

  const userKey = crypto.randomUUID();
  const cookieValue = `ld_user_key=${encodeURIComponent(userKey)}; Path=/; HttpOnly; SameSite=Lax`;
  res.setHeader('Set-Cookie', cookieValue);
  return userKey;
};

app.get('/', async (req, res, next) => {
  try {
    await client.waitForInitialization();
    const userKey = getOrSetUserKey(req, res);
    const user = { key: userKey, anonymous: true };
    const showFeaturedLinks = await client.variation(
      FEATURED_LINKS_FLAG_KEY,
      user,
      true
    );
    if (!indexHtmlCache) {
      indexHtmlCache = fs.readFileSync(indexPath, 'utf8');
    }
    let html = indexHtmlCache;
    if (!showFeaturedLinks) {
      html = stripFlaggedBlock(html, FEATURED_LINKS_FLAG_KEY);
    }
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    next(err);
  }
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

app.get('/launchdarkly', (req, res) => {
  res.sendFile(path.join(pagesDir, 'launchdarkly.html'));
});

app.get('/launchdarkly-embed', (req, res) => {
  res.sendFile(path.join(pagesDir, 'launchdarkly-embed.html'));
});

app.get('/launchdarly-embed', (req, res) => {
  res.sendFile(path.join(pagesDir, 'launchdarkly-embed.html'));
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
  console.log(`Admin login: admin@canya.com / admin123`);
});

