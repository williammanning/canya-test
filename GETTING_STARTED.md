# Canya Application - Getting Started Guide

## 🎉 Your Application is Ready!

The Canya Node.js application has been successfully created and is running on `http://localhost:3000`.

## Quick Start

### Access the Application
- **Home Page**: http://localhost:3000
- **Services**: http://localhost:3000/services
- **About Us**: http://localhost:3000/about
- **Admin Login**: http://localhost:3000/login
- **Admin Dashboard**: http://localhost:3000/admin (after login)

### Default Admin Credentials
- **Email**: admin@canya.com
- **Password**: admin123

**⚠️ Important**: Change these credentials immediately in a production environment!

## Features Overview

### 📱 Public Pages
All pages are fully responsive and work perfectly on:
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- **iPad** and tablets
- **iPhone** and mobile phones

#### 1. **Home Page** (`/`)
- Mission statement and overview
- Featured resources section
- Quick action cards
- Contact form
- Call-to-action buttons

#### 2. **Services Page** (`/services`)
- Displays service categories
- Shows external resource links
- Organized grid layout
- Direct links to partner organizations

#### 3. **About Us Page** (`/about`)
- Team member profiles with photos
- Member bios and roles
- Team values section
- Company story

#### 4. **Login Page** (`/login`)
- Admin authentication
- Secure token-based access
- Session management

### 🔐 Admin Backend

The admin dashboard provides full control over:

#### **User Management**
- Add new admin users
- Edit user details (email, name, role)
- Change user passwords
- Delete users
- Assign admin or user roles

#### **Link Management**
- Add external service links (e.g., Greenpeace, BLM)
- Edit link information:
  - Name
  - URL
  - Description
- Delete links
- Display links across the site

#### **Service Management**
- Create service categories
- Edit service details:
  - Name
  - Description
  - Icon (emoji)
- Remove services
- Organize community resources

## Database Structure

The application uses a file-based NoSQL database stored in `/data/`:

### `users.json`
```json
{
  "id": "unique-id",
  "email": "user@example.com",
  "password": "hashed-password",
  "name": "User Name",
  "role": "admin" // or "user"
}
```

### `links.json`
```json
{
  "id": "unique-id",
  "name": "Organization Name",
  "url": "https://example.com",
  "description": "What this organization does"
}
```

### `services.json`
```json
{
  "id": "unique-id",
  "name": "Service Category",
  "description": "Service description",
  "icon": "🌍" // emoji
}
```

### `members.json`
```json
{
  "id": "unique-id",
  "name": "Member Name",
  "role": "Job Title",
  "bio": "Member biography",
  "image": "https://image-url.com"
}
```

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/login
  - Body: { email, password }
  - Returns: { token, user }

POST /api/auth/verify
  - Headers: Authorization: Bearer {token}
  - Returns: { valid: boolean, user: object }
```

### Admin Endpoints (Protected)
All require: `Authorization: Bearer {token}`

#### Users
```
GET /api/users                    - Get all users
POST /api/users                   - Create user
PUT /api/users/:id                - Update user
DELETE /api/users/:id             - Delete user
```

#### Links
```
GET /api/links                    - Get all links
POST /api/links                   - Create link
PUT /api/links/:id                - Update link
DELETE /api/links/:id             - Delete link
```

#### Services
```
GET /api/services                 - Get all services
POST /api/services                - Create service
PUT /api/services/:id             - Update service
DELETE /api/services/:id          - Delete service
```

### Public Endpoints (No Authentication)
```
GET /api/public/services          - Get all services
GET /api/public/links             - Get all links
GET /api/public/members           - Get all team members
```

## Customization Guide

### 1. Change Site Branding
Edit the logo and navigation in HTML files:
  - `public/index.html` - Change "Canya" to your site name
- `public/styles.css` - Update color variables

### 2. Customize Colors
Edit `:root` variables in `public/styles.css`:
```css
:root {
  --primary: #6366f1;        /* Main brand color (indigo) */
  --primary-dark: #4f46e5;   /* Dark variant */
  --secondary: #10b981;      /* Secondary color (green) */
  --accent: #f59e0b;         /* Accent color (gold) */
  --text: #1f2937;           /* Text color */
  --bg: #ffffff;             /* Background */
}
```

### 3. Add Team Members
Edit `data/members.json`:
```json
{
  "id": "unique-id",
  "name": "Person Name",
  "role": "Position Title",
  "bio": "Short biography",
  "image": "https://image-url.com/photo.jpg"
}
```

### 4. Modify Navigation
Edit the `<nav>` section in any HTML file to add/remove menu items.

### 5. Change Default Data
Update the initial data in `server.js` in the `initializeDataFiles()` function.

## Development Tips

### Running the Server
```bash
# Production
npm start

# Development (auto-reload on file changes)
npm run dev
```

### File Structure
```
canya-test/
├── public/              # Frontend files (served as-is)
├── data/                # File-based database
├── routes/              # API route handlers
├── middleware/          # Authentication & database utilities
├── server.js            # Main Express server
└── package.json         # Dependencies
```

### Adding New Features

**Add a new route:**
1. Create a new file in `routes/` folder
2. Import and use it in `server.js` with `app.use()`

**Add new data type:**
1. Create a new JSON file in `data/` folder
2. Add initialization in `server.js`
3. Create routes to manage it

## Security Considerations

### Production Checklist
- [ ] Change the default admin password
- [ ] Set the `SECRET_KEY` environment variable
- [ ] Use HTTPS instead of HTTP
- [ ] Add rate limiting to `/api/auth/login`
- [ ] Consider moving to a real database (MongoDB, PostgreSQL)
- [ ] Add CSRF protection
- [ ] Implement proper user roles and permissions
- [ ] Add input validation and sanitization
- [ ] Consider adding two-factor authentication

### Environment Variables
Create a `.env` file:
```
PORT=3000
SECRET_KEY=your_very_secure_secret_key_here
NODE_ENV=production
```

## Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Check `npm install` completed successfully
- Verify Node.js version (v12+)

### Cannot login
- Check credentials: admin@canya.com / admin123
- Ensure JWT token is being stored in localStorage
- Clear browser cache and try again

### Data not persisting
- Check that `/data/` directory exists
- Verify file permissions on the data directory
- Check server logs for errors

### Styling issues on mobile
- Make sure you're viewing with responsive design mode
- Check that viewport meta tag is present
- Test on actual devices for best results

## Next Steps

1. **Customize the branding**: Update logo, colors, and content
2. **Add team members**: Edit `data/members.json`
3. **Add service links**: Use the admin dashboard
4. **Change the admin password**: Edit `data/users.json` or create new user
5. **Deploy**: Consider deploying to Heroku, Vercel, or your own server
6. **Migrate database**: Move to MongoDB or PostgreSQL for production

## Support & Resources

- **Node.js Documentation**: https://nodejs.org/docs/
- **Express.js Guide**: https://expressjs.com/
- **CSS Customization**: Study `public/styles.css` for design changes

---

**Happy building with Canya! 🌍✨**
