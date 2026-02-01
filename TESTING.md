# Canya - Testing Guide

## 🧪 Manual Testing

### 1. Test Home Page
```
URL: http://localhost:3000
Expected:
- Hero section with mission statement
- Featured Resources cards
- Quick Links section
- Contact form
```

### 2. Test Services Page
```
URL: http://localhost:3000/services
Expected:
- Service Categories grid
- Featured Links section with Greenpeace and BLM links
- All with responsive layout
```

### 3. Test About Us Page
```
URL: http://localhost:3000/about
Expected:
- Team member cards with photos
- Member bios and roles
- Company values section
```

### 4. Test Login
```
URL: http://localhost:3000/login
Credentials:
- Email: admin@canya.com
- Password: admin123
Expected:
- Successful login
- Redirect to admin dashboard
- Token stored in localStorage
```

### 5. Test Admin Dashboard
```
URL: http://localhost:3000/admin (after login)
Expected:
- Dashboard with statistics
- Navigation sidebar
- User management section
- Link management section
- Service management section
```

---

## 🔧 API Testing with cURL

### Test Public Endpoints

#### Get Services
```bash
curl -s http://localhost:3000/api/public/services | json_pp
```

#### Get Links
```bash
curl -s http://localhost:3000/api/public/links | json_pp
```

#### Get Members
```bash
curl -s http://localhost:3000/api/public/members | json_pp
```

### Test Authentication

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@canya.com","password":"admin123"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@canya.com",
    "name": "Administrator",
    "role": "admin"
  }
}
```

#### Verify Token
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### Test Admin Endpoints

#### Get All Users
```bash
TOKEN="your_token_here"
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users | json_pp
```

#### Create New User
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email":"newuser@example.com",
    "password":"password123",
    "name":"New User",
    "role":"user"
  }'
```

#### Get All Links
```bash
TOKEN="your_token_here"
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/links | json_pp
```

#### Create New Link
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Sierra Club",
    "url":"https://www.sierraclub.org",
    "description":"Protecting wildlife and the environment"
  }'
```

#### Get All Services
```bash
TOKEN="your_token_here"
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/services | json_pp
```

#### Create New Service
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Community Health",
    "description":"Organizations promoting public health and wellness",
    "icon":"⚕️"
  }'
```

#### Update a Link
```bash
TOKEN="your_token_here"
LINK_ID="1"
curl -X PUT http://localhost:3000/api/links/$LINK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Updated Name",
    "url":"https://updated-url.com",
    "description":"Updated description"
  }'
```

#### Delete a Link
```bash
TOKEN="your_token_here"
LINK_ID="1"
curl -X DELETE http://localhost:3000/api/links/$LINK_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Automated Testing (Postman/Insomnia)

### Import Collection

Create a collection in Postman/Insomnia with these endpoints:

**Base URL**: `http://localhost:3000`

**Environment Variables**:
- `token`: Store JWT token here
- `baseUrl`: `http://localhost:3000`

### Test Sequence

1. **Login**
   - Method: POST
   - URL: `{{baseUrl}}/api/auth/login`
   - Body: JSON
   ```json
   {
     "email": "admin@canya.com",
     "password": "admin123"
   }
   ```
   - Store token in environment

2. **Get Users**
   - Method: GET
   - URL: `{{baseUrl}}/api/users`
   - Header: `Authorization: Bearer {{token}}`

3. **Create Service**
   - Method: POST
   - URL: `{{baseUrl}}/api/services`
   - Header: `Authorization: Bearer {{token}}`
   - Body: JSON
   ```json
   {
     "name": "Test Service",
     "description": "Test Description",
     "icon": "🧪"
   }
   ```

4. **Get Public Services**
   - Method: GET
   - URL: `{{baseUrl}}/api/public/services`
   - No authentication required

---

## 📱 Responsive Design Testing

### Test on Different Devices

#### iPhone Sizes
- [ ] iPhone SE (375x667)
- [ ] iPhone 12 (390x844)
- [ ] iPhone 14 (390x844)
- [ ] iPhone 14 Pro Max (430x932)

#### iPad Sizes
- [ ] iPad Mini (768x1024)
- [ ] iPad Air (820x1180)
- [ ] iPad Pro 12.9" (1024x1366)

#### Desktop
- [ ] 1920x1080 (Full HD)
- [ ] 2560x1440 (2K)
- [ ] 3840x2160 (4K)

#### Browser DevTools
```
Chrome DevTools:
1. Press F12
2. Click device toggle (Ctrl+Shift+M / Cmd+Shift+M)
3. Test each breakpoint
4. Test portrait/landscape
```

### Responsive Test Checklist
- [ ] Header navigation works on mobile
- [ ] Cards stack properly on mobile
- [ ] Forms are easy to fill on mobile
- [ ] Tables are readable (may need horizontal scroll)
- [ ] Images scale correctly
- [ ] Text is readable at all sizes
- [ ] Buttons are touch-friendly (min 44x44px)

---

## 🔐 Security Testing

### Test Protected Routes

#### Without Token
```bash
curl -s http://localhost:3000/api/users
# Expected: 401 Unauthorized
```

#### With Invalid Token
```bash
curl -s -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/users
# Expected: 403 Forbidden
```

#### With Expired Token
Test by modifying SECRET_KEY and using old token
```bash
# Expected: 403 Forbidden (Invalid or expired token)
```

### Test Role-Based Access

#### Admin Can Create User
```bash
# Should succeed with token
```

#### Non-Admin Cannot Create User
```bash
# Update a user to role "user" in data/users.json
# Try to create user with non-admin token
# Expected: Failure (if role check is implemented)
```

---

## 🐛 Error Testing

### Test 404 Page
```
URL: http://localhost:3000/nonexistent
Expected: 404 error page with friendly message
```

### Test Login Errors
1. **Wrong password**
   - Email: admin@canya.com
   - Password: wrongpassword
   - Expected: "Invalid email or password"

2. **Non-existent email**
   - Email: nonexistent@example.com
   - Password: anything
   - Expected: "Invalid email or password"

3. **Missing fields**
   - Leave email or password empty
   - Expected: Validation error

### Test API Validation
```bash
# Missing required field
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Only Name"}'
# Expected: 400 Bad Request
```

---

## 📊 Data Verification

### Check data/users.json
```bash
cat data/users.json | json_pp
```

Expected structure:
- Array of user objects
- Each has: id, email, password (hashed), name, role

### Check data/links.json
```bash
cat data/links.json | json_pp
```

Expected structure:
- Array of link objects
- Each has: id, name, url, description

### Check data/services.json
```bash
cat data/services.json | json_pp
```

Expected structure:
- Array of service objects
- Each has: id, name, description, icon

### Check data/members.json
```bash
cat data/members.json | json_pp
```

Expected structure:
- Array of member objects
- Each has: id, name, role, bio, image

---

## 🚀 Performance Testing

### Load Testing (using Apache Bench)

#### Installation
```bash
# macOS
brew install httpd
# Ubuntu
sudo apt-get install apache2-utils
```

#### Test Home Page
```bash
ab -n 1000 -c 10 http://localhost:3000/
```
- `-n 1000`: Total requests
- `-c 10`: Concurrent requests
- Expected: < 100ms per request

#### Test API Endpoint
```bash
ab -n 1000 -c 10 http://localhost:3000/api/public/services
```

---

## ✅ Testing Checklist

### Frontend
- [ ] All pages load without errors
- [ ] Navigation works on all pages
- [ ] Responsive design works (desktop, tablet, mobile)
- [ ] Contact form submits successfully
- [ ] Links open in new tabs
- [ ] Images load correctly

### Admin Dashboard
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong credentials fails
- [ ] Can navigate between admin sections
- [ ] Can add new users
- [ ] Can edit existing users
- [ ] Can delete users (with confirmation)
- [ ] Can add new links
- [ ] Can edit existing links
- [ ] Can delete links
- [ ] Can add new services
- [ ] Can edit existing services
- [ ] Can delete services
- [ ] Data persists after page reload
- [ ] Logout works correctly

### API
- [ ] Public endpoints accessible without token
- [ ] Admin endpoints require token
- [ ] Invalid tokens are rejected
- [ ] CRUD operations work for all resources
- [ ] Proper error messages returned

### Database
- [ ] Data files exist in `/data/`
- [ ] Data persists after server restart
- [ ] Data is properly formatted JSON

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

Functionality Tested: ___________
Expected Result: ___________
Actual Result: ___________
Status: [ ] Pass [ ] Fail

Notes:
___________

Issues Found:
[ ] None
[ ] Minor (cosmetic)
[ ] Major (functionality broken)
[ ] Critical (security/data loss)

Issue Details:
___________
```

---

**Happy Testing! 🧪✨**
