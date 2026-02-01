# 📚 Canya - Complete File Index & Documentation

## 🎯 Quick Start
1. **Server running on**: `http://localhost:3000` ✅
2. **Admin login**: `admin@canya.com` / `admin123`
3. **For setup help**: See `GETTING_STARTED.md`

---

## 📁 Complete File Structure & Description

### 📄 Root Configuration Files

#### `package.json` (477 bytes)
- Node.js project configuration
- Lists all dependencies
- Defines npm scripts (`npm start`, `npm run dev`)
- Project metadata

#### `server.js` (3.8 KB)
- **Main Express.js server file**
- Initializes all routes
- Sets up middleware
- Creates data files on startup
- Starts server on port 3000

#### `setup.sh` (1.2 KB)
- Automated setup script
- Checks Node.js/npm installation
- Installs dependencies
- Creates necessary directories

---

## 📖 Documentation Files

### `README.md` (5.3 KB)
**Project Overview & Setup**
- Features overview
- Installation steps
- Project structure explanation
- API endpoint documentation
- Technology stack
- Customization guide
- Security notes

### `GETTING_STARTED.md` (7.4 KB)
**Quick Start & Usage Guide**
- Application access URLs
- Feature overviews
- Database structure explanation
- API endpoint reference
- Customization instructions
- Development tips
- Troubleshooting guide

### `DEPLOYMENT.md` (5.4 KB)
**Deployment Instructions**
- Local development setup
- Heroku deployment guide
- Railway.app deployment
- AWS EC2 deployment
- Data persistence strategies
- HTTPS/SSL setup
- Production checklist
- Monitoring setup

### `TESTING.md` (9.5 KB)
**Complete Testing Guide**
- Manual testing procedures
- API testing with cURL
- Postman/Insomnia setup
- Responsive design testing
- Security testing
- Error testing
- Performance testing
- Testing checklist

### `PROJECT_SUMMARY.md` (11 KB)
**Comprehensive Project Overview**
- Delivery checklist (all ✅)
- Complete project structure
- Getting started guide
- Design highlights
- Security features
- API documentation
- Customization guide
- Learning resources

---

## 🔧 Core Application Files

### `middleware/auth.js` (0.5 KB)
**JWT Authentication Middleware**
- Verifies JWT tokens
- Extracts user info from token
- Protects admin routes
- Returns 401/403 errors on invalid tokens

### `middleware/db.js` (0.7 KB)
**File-Based Database Utilities**
- `readData(filename)` - Reads JSON files
- `writeData(filename, data)` - Saves JSON files
- Handles file creation/errors
- Located in `/data/` directory

### `routes/auth.js` (1.2 KB)
**Authentication Endpoints**
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify` - Verify JWT token
- Returns JWT token + user info
- Validates credentials with bcryptjs

### `routes/api.js` (4.1 KB)
**Protected Admin API Routes**
- User CRUD operations
- Link CRUD operations
- Service CRUD operations
- All require JWT token
- Role-based access control (admin only)

### `routes/public.js` (0.7 KB)
**Public API Routes (No Auth)**
- `GET /api/public/services` - Get all services
- `GET /api/public/links` - Get all links
- `GET /api/public/members` - Get all team members

---

## 🎨 Frontend Files

### `public/styles.css` (15 KB)
**Global Responsive Stylesheet**
- Modern CSS variables for theming
- Responsive grid system
- Mobile-first design (480px, 768px breakpoints)
- Card and button styles
- Form styling
- Table styling
- Animations and transitions
- Color scheme (indigo, green, gold)

### `public/index.html` (3.2 KB)
**Home Page**
- Hero section with mission statement
- About section
- Quick links cards
- Featured resources grid
- Contact form
- Fetch API to load featured links
- Responsive navigation

### `public/pages/services.html` (1.8 KB)
**Services & Links Page**
- Service categories grid
- All external links with descriptions
- Responsive layout
- Direct links to partner organizations

### `public/pages/about.html` (2.1 KB)
**Team & About Us Page**
- Company story section
- Team member cards with photos
- Member bios and roles
- Company values section
- Fetch API to load team members

### `public/pages/login.html` (1.9 KB)
**Admin Login Page**
- Email and password form
- Error/success alerts
- Auto-redirect if already logged in
- Token storage in localStorage
- Demo credentials display

### `public/pages/admin.html` (7.2 KB)
**Admin Dashboard**
- Responsive sidebar navigation
- Dashboard with statistics
- User management table
- Link management table
- Service management table
- Modals for create/edit operations
- Protected by token verification

### `public/js/admin.js` (8.3 KB)
**Admin Dashboard JavaScript**
- Authentication check
- User management (CRUD)
- Link management (CRUD)
- Service management (CRUD)
- Modal controls
- Form submissions
- Data refresh/reload
- Logout functionality

### `public/404.html` (1.2 KB)
**404 Error Page**
- User-friendly error message
- Link back to home
- Consistent styling with site

---

## 💾 Database Files (in `/data/`)

### `data/users.json`
**User Accounts**
```json
[
  {
    "id": "1",
    "email": "admin@canya.com",
    "password": "$2a$10$...",  // hashed
    "name": "Administrator",
    "role": "admin"
  }
]
```

### `data/links.json`
**External Service Links**
```json
[
  {
    "id": "1",
    "name": "Greenpeace",
    "url": "https://www.greenpeace.org",
    "description": "Global environmental organization..."
  }
]
```

### `data/services.json`
**Service Categories**
```json
[
  {
    "id": "1",
    "name": "Environmental Conservation",
    "description": "Organizations working to protect...",
    "icon": "🌍"
  }
]
```

### `data/members.json`
**Team Members**
```json
[
  {
    "id": "1",
    "name": "Sarah Johnson",
    "role": "Founder & Director",
    "bio": "Community advocate with 10+ years...",
    "image": "https://via.placeholder.com/150"
  }
]
```

---

## 📊 File Statistics

| Category | Files | Total Size |
|----------|-------|-----------|
| Documentation | 5 files | ~38 KB |
| Backend Code | 4 files | ~10 KB |
| Frontend HTML | 7 files | ~17 KB |
| Frontend CSS | 1 file | ~15 KB |
| Frontend JS | 1 file | ~8 KB |
| Configuration | 3 files | ~2 KB |
| **Total (without node_modules)** | **21 files** | **~90 KB** |

---

## 🔑 Key Features by File

### Authentication & Security
- `middleware/auth.js` - JWT verification
- `routes/auth.js` - Login/token management
- Password hashing with bcryptjs

### Data Management
- `middleware/db.js` - File I/O
- `data/*.json` - All application data
- `routes/api.js` - Data CRUD operations

### User Interface
- `public/styles.css` - Responsive design
- `public/pages/*.html` - All pages
- `public/js/admin.js` - Admin functionality

### API Endpoints
- `routes/auth.js` - 2 endpoints
- `routes/api.js` - 12 endpoints
- `routes/public.js` - 3 endpoints
- **Total: 17 API endpoints**

---

## 🚀 What Each File Does

### When Server Starts
1. `server.js` initializes
2. Creates `/data/` directory if missing
3. Creates default JSON files in `data/` with sample data
4. Registers all routes from `/routes/`
5. Loads middleware
6. Listens on port 3000

### When User Visits Home Page
1. `public/index.html` loads
2. `public/styles.css` applies styling
3. JavaScript fetches featured links from `/api/public/links`
4. Featured links display in cards

### When Admin Logs In
1. User fills form on `public/pages/login.html`
2. Posts to `/api/auth/login`
3. `routes/auth.js` validates credentials
4. JWT token returned and stored in localStorage
5. Redirect to `/admin`
6. `public/pages/admin.html` loads
7. `public/js/admin.js` verifies token
8. Dashboard displays statistics and tables

### When Admin Adds a Service
1. Form submitted from `public/pages/admin.html`
2. `public/js/admin.js` posts to `/api/services`
3. `middleware/auth.js` verifies token
4. `routes/api.js` handles request
5. `middleware/db.js` saves to `data/services.json`
6. Service appears on `/services` page

---

## 🔐 Security Architecture

### Token Flow
```
Login Form → /api/auth/login → JWT Token → localStorage
Request → Bearer Token Header → /api/auth/verify → Route Handler
```

### Protected Routes
- All `/api/` endpoints except `/api/auth/login` and `/api/public/*`
- Verified by `middleware/auth.js`
- Returns 401/403 on invalid token

### Password Security
- Hashed with bcryptjs (10 salt rounds)
- Never stored in plain text
- Compared on login attempt

---

## 📱 Responsive Breakpoints

### All CSS Located In
- `public/styles.css`

### Breakpoints
- **Desktop**: 1200px+ (full features)
- **Tablet**: 768px-1200px (stacked grids)
- **Mobile**: 480px-768px (single column)
- **Small phone**: <480px (minimal layout)

---

## 🛠️ Development Workflow

### File Editing for Customization
1. **Change colors**: Edit `:root` in `public/styles.css`
2. **Add pages**: Create new HTML in `public/pages/`
3. **Add routes**: Create new file in `routes/`
4. **Modify data**: Edit JSON files in `data/`
5. **Update UI**: Edit `public/pages/*.html`
6. **Update styles**: Edit `public/styles.css`

### Adding New Features
1. Create route file in `routes/`
2. Create HTML page in `public/pages/`
3. Add styles to `public/styles.css`
4. Add JavaScript to `public/js/`
5. Restart server

---

## 📚 File Dependencies

### `server.js` depends on:
- `routes/auth.js`
- `routes/api.js`
- `routes/public.js`
- `middleware/db.js`
- Express.js
- body-parser

### `routes/api.js` depends on:
- `middleware/db.js`
- `middleware/auth.js`

### `public/pages/admin.html` depends on:
- `public/js/admin.js`
- `public/styles.css`

### All HTML files depend on:
- `public/styles.css`
- Font files (via Google Fonts)

---

## 🎯 File Organization Strategy

### By Function
- **Core**: `server.js`, `package.json`
- **Routes**: `routes/` folder (API endpoints)
- **Middleware**: `middleware/` folder (Auth, Database)
- **Frontend**: `public/` folder (HTML, CSS, JS)
- **Data**: `data/` folder (JSON databases)
- **Docs**: Root MD files (README, GETTING_STARTED, etc.)

### By Concern
- **Security**: `middleware/auth.js`, `routes/auth.js`
- **Database**: `middleware/db.js`, `data/*.json`, `routes/api.js`
- **UI**: `public/**`, `public/styles.css`
- **Admin**: `public/pages/admin.html`, `public/js/admin.js`

---

## 💾 Total Project Size

```
Source Code: ~90 KB (without node_modules)
Dependencies: ~50 MB (node_modules/)
Database: ~5 KB (data/*.json)
Complete Project: ~50 MB
```

---

## 📋 Recommended Reading Order

1. **First Time Setup**: Start with `GETTING_STARTED.md`
2. **Understanding Features**: Read `README.md`
3. **Customization**: Check `PROJECT_SUMMARY.md`
4. **Testing**: Use `TESTING.md`
5. **Deployment**: Follow `DEPLOYMENT.md`
6. **Code Exploration**: Explore `/routes/` and `/public/`

---

## 🎓 Learning Path

### Beginners
1. Start server: `npm start`
2. Use admin dashboard to add content
3. View changes on public pages
4. Read `GETTING_STARTED.md`

### Intermediate
1. Modify HTML pages
2. Change CSS styles
3. Add new team members to data
4. Edit database files directly

### Advanced
1. Create new API routes
2. Add new features in JavaScript
3. Migrate to real database
4. Deploy to production

---

## 🚀 Quick Reference

### Start Server
```bash
npm start
```

### View Home
```
http://localhost:3000
```

### Access Admin
```
http://localhost:3000/admin
Email: admin@canya.com
Password: admin123
```

### Check API
```bash
curl http://localhost:3000/api/public/services
```

### View All Files
```bash
ls -R
```

### Edit User Password (Emergency)
1. Edit `data/users.json`
2. Reset password hash using bcryptjs or admin dashboard

---

**All files are ready and working! Start with `npm start` to see it in action.** 🎉

