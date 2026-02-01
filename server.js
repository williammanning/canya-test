const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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
      password: '$2a$10$eImiTXuWVxfaHNYY0iNAUOYky9RCLY/8eDK5lqzkB.pXfqZBGJGNm', // password: admin123
      name: 'Administrator',
      role: 'admin'
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
      bio: 'Community advocate with 10+ years of experience in nonprofit work',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: '2',
      name: 'Marcus Williams',
      role: 'Operations Lead',
      bio: 'Passionate about connecting communities with resources',
      image: 'https://via.placeholder.com/150'
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      role: 'Partnerships Coordinator',
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

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const publicRoutes = require('./routes/public');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/public', publicRoutes);

// Serve HTML pages
const pagesDir = path.join(__dirname, 'public', 'pages');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
  console.log(`Admin login: admin@canya.com / admin123`);
});
