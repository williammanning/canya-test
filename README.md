# Canya - Community Services Platform

A modern, friendly, and responsive web application for community building and service discovery. Built with Node.js, Express, and vanilla JavaScript.

## Features

### Public Pages
- **Home Page**: Information about Canya's mission with featured resources
- **Services Page**: Browse and discover community service categories and external organizations
- **About Us Page**: Meet the team members with profiles
- **LaunchDarkly Status Page**: Real-time monitoring dashboard for feature flags, AI configs, observability, and SDK connection status
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Light/Dark Theme**: Toggle between light and dark color schemes with persistent preference

### Admin Backend
- **User Management**: Add, edit, and delete admin users
- **Link Management**: Manage external service links with descriptions
- **Service Management**: Create and manage service categories
- **Authentication**: Secure login system with JWT tokens

### Feature Flags (LaunchDarkly)
- **Featured Resources Toggle**: Control visibility of the featured links section
- **AI Chatbot Toggle**: Enable/disable the Gemini-powered help chatbot
- **AI Config Management**: JSON-based configurations for chatbot model settings (temperature, max tokens, system prompt)
- **Real-time Updates**: Feature flag changes reflect immediately without page reload
- **Status Dashboard**: Dedicated monitoring page showing:
  - SDK connection status and details
  - All active feature flags with current values
  - AI configuration flags (JSON objects)
  - Observability features (network recording, session replay)
  - Recent custom events and flag changes
- **Event Tracking**: Monitor custom events and flag changes in real-time
- **Observability Plugins**: Network recording and session replay enabled via LaunchDarkly plugins

### AI Chatbot (Gemini 2.0 Flash)
- **Intelligent Assistance**: AI-powered chatbot to help users with questions
- **Community Focus**: Trained to assist with community services, environmental conservation, and social justice topics
- **Secure Implementation**: API key protected on the server side
- **Responsive UI**: Clean chat interface with real-time messaging

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: File-based NoSQL (JSON files in `/data` directory)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: JWT + bcryptjs
- **Security**: Protected API routes with token verification
- **Feature Flags**: LaunchDarkly SDK (client & server) with Observability and Session Replay plugins
- **AI Integration**: Google Gemini 2.0 Flash (via API)
- **Theming**: CSS custom properties with light/dark modes and localStorage persistence

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your API keys:
   ```
   LAUNCHDARKLY_SDK_KEY=your_launchdarkly_sdk_key
   GEMINI_API_KEY=your_gemini_api_key
   PORT=3000
   ```
   
   **Get your API keys:**
   - LaunchDarkly SDK Key: Sign up at [launchdarkly.com](https://launchdarkly.com) and create a project
   - Gemini API Key: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - Admin login: `http://localhost:3000/login`
   - Default credentials: `admin@canya.com` / `admin123`
   - LaunchDarkly Status: `http://localhost:3000/launchdarkly`
   - **Toggle Theme**: Click the sun/moon button in the header to switch between light and dark modes

5. **Configure Feature Flags**
   In your LaunchDarkly dashboard, create the following flags:
   
   **Boolean Flags:**
   - `featured-resources` - Controls the Featured Resources section visibility
   - `enable-chatbot-for-help` - Controls the AI Chatbot visibility
   - `featured-links-frame` - Controls featured links frame display
   
   **JSON Flags (AI Configs):**
   - `canya-chatbot-assistant` - AI configuration object with:
     ```json
     {
       "enabled": true,
       "model": "gemini-2-flash-preview",
       "temperature": 0.7,
       "maxTokens": 1024,
       "systemPrompt": "You are a helpful assistant for Canya..."
     }
     ```
   
   Visit `/launchdarkly` to monitor flag status and SDK connection in real-time.

## Project Structure

```
canya-test/
├── public/                 # Frontend files
│   ├── index.html         # Home page
│   ├── styles.css         # Global styles with CSS variables for theming
│   ├── 404.html           # 404 page
│   ├── js/
│   │   ├── admin.js       # Admin dashboard JavaScript
│   │   ├── ld.js          # LaunchDarkly client initialization
│   │   ├── ld-status.js   # LaunchDarkly status page logic
│   │   ├── theme.js       # Light/dark theme manager
│   │   └── chatbot.js     # Gemini AI chatbot integration
│   └── pages/
│       ├── services.html     # Services page
│       ├── about.html        # About us page
│       ├── login.html        # Login page
│       ├── admin.html        # Admin dashboard
│       ├── profile.html      # User profile page
│       └── launchdarkly.html # LaunchDarkly status & monitoring
├── data/                   # File-based database
│   ├── users.json         # User accounts
│   ├── links.json         # External service links
│   ├── services.json      # Service categories
│   └── members.json       # Team members
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── api.js             # Protected API routes (includes chatbot)
│   └── public.js          # Public data endpoints
├── middleware/
│   ├── auth.js            # JWT verification
│   └── db.js              # File-based database utilities
├── server.js              # Express server setup
├── .env.example           # Environment variables template
└── package.json           # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/verify` - Verify JWT token

### Admin Routes (Require Authentication)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/links` - Get all links
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Public Routes
- `GET /api/public/services` - Get all services
- `GET /api/public/links` - Get all links
- `GET /api/public/members` - Get team members
- `POST /api/chatbot` - Send message to AI chatbot (proxies to Gemini API)

### Add Team Members
Edit `data/members.json` to add or modify team member profiles.

### Change Secret Key (Important for Production)
Set the `SECRET_KEY` environment variable:
```bash
export SECRET_KEY=your_secure_secret_key
```

## Theming

The application supports both light and dark color schemes:

### Features
- **Automatic Persistence**: Theme preference is saved to browser's `localStorage`
- **No Flash Effect**: Theme loads instantly before page render
- **Smooth Transitions**: All color changes animate smoothly
- **Universal Support**: Theme applies across all pages

### Usage
- Click the sun/moon button in the header to toggle themes
- Theme preference persists across browser sessions
- Default theme is dark mode

### Theme Variables
All colors use CSS custom properties defined in `styles.css`:
- Light theme: Clean white backgrounds with dark text
- Dark theme: Black backgrounds with white text and glassmorphism effects

### Programmatic Access
The theme can be controlled via console:
```javascript
themeManager.toggle()          // Toggle between light and dark
themeManager.set('light')      // Set light theme
themeManager.set('dark')       // Set dark theme
themeManager.get()             // Get current theme
```

## Security Notes

- The default admin password is `admin123` - **Change this immediately in production**
- Store sensitive data in environment variables
- Use HTTPS in production
- Consider adding rate limiting for authentication endpoints
- Implement more robust user roles and permissions as needed

## Future Enhancements

- Email notifications for admin actions
- User profile pages with member bios
- Event management system
- Donation/contribution tracking
- Community blog or news section
- API documentation with Swagger
- Database migration to MongoDB or PostgreSQL
- Docker containerization

## License

MIT
Canya Test
