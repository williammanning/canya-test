# Canya - Community Services Platform

A modern, friendly, and responsive web application for community building and service discovery. Built with Node.js, Express, and vanilla JavaScript.

## Features

### Public Pages
- **Home Page**: Information about Canya's mission with featured resources
- **Services Page**: Browse and discover community service categories and external organizations
- **About Us Page**: Meet the team members with profiles
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Admin Backend
- **User Management**: Add, edit, and delete admin users
- **Link Management**: Manage external service links with descriptions
- **Service Management**: Create and manage service categories
- **Authentication**: Secure login system with JWT tokens

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: File-based NoSQL (JSON files in `/data` directory)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: JWT + bcryptjs
- **Security**: Protected API routes with token verification

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - Admin login: `http://localhost:3000/login`
   - Default credentials: `admin@canya.com` / `admin123`

## Project Structure

```
canya-test/
├── public/                 # Frontend files
│   ├── index.html         # Home page
│   ├── styles.css         # Global styles
│   ├── 404.html           # 404 page
│   ├── js/
│   │   └── admin.js       # Admin dashboard JavaScript
│   └── pages/
│       ├── services.html  # Services page
│       ├── about.html     # About us page
│       ├── login.html     # Login page
│       └── admin.html     # Admin dashboard
├── data/                   # File-based database
│   ├── users.json         # User accounts
│   ├── links.json         # External service links
│   ├── services.json      # Service categories
│   └── members.json       # Team members
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── api.js             # Protected API routes
│   └── public.js          # Public data endpoints
├── middleware/
│   ├── auth.js            # JWT verification
│   └── db.js              # File-based database utilities
├── server.js              # Express server setup
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

### Add Team Members
Edit `data/members.json` to add or modify team member profiles.

### Change Secret Key (Important for Production)
Set the `SECRET_KEY` environment variable:
```bash
export SECRET_KEY=your_secure_secret_key
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
