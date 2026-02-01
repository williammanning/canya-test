let currentEditingId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  loadDashboard();
});

function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    window.location.href = '/login';
    return;
  }

  // Verify token
  fetch('/api/auth/verify', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    if (!data.valid) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      displayUserInfo(data.user);
    }
  });
}

function displayUserInfo(user) {
  const userInfo = document.getElementById('user-info');
  userInfo.innerHTML = `
    <p><strong>${user.name}</strong></p>
    <p>${user.email}</p>
    <p>Role: ${user.role}</p>
  `;
}

function setupEventListeners() {
  // Navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const section = e.target.dataset.section;
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(section).classList.add('active');

      if (section === 'users') loadUsers();
      else if (section === 'links') loadLinks();
      else if (section === 'services') loadServices();
    });
  });

  // Form submissions
  document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
  document.getElementById('link-form').addEventListener('submit', handleLinkSubmit);
  document.getElementById('service-form').addEventListener('submit', handleServiceSubmit);
}

function navigateToSection(sectionName) {
  // Update active button
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const button = document.querySelector(`[data-section="${sectionName}"]`);
  if (button) button.classList.add('active');
  
  // Show section
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(sectionName);
  if (section) {
    section.classList.add('active');
    
    // Load data
    if (sectionName === 'users') loadUsers();
    else if (sectionName === 'links') loadLinks();
    else if (sectionName === 'services') loadServices();
  }
}

async function loadDashboard() {
  const token = localStorage.getItem('token');

  try {
    const [users, links, services] = await Promise.all([
      fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/links', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]);

    document.getElementById('user-count').textContent = users.length;
    document.getElementById('link-count').textContent = links.length;
    document.getElementById('service-count').textContent = services.length;
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

// User Management
async function loadUsers() {
  const token = localStorage.getItem('token');
  try {
    const users = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());

    const tbody = document.getElementById('users-table');
    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.email}</td>
        <td>${user.name}</td>
        <td>${user.role}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-small" onclick="editUser('${user.id}', '${user.email}', '${user.name}', '${user.role}')">Edit</button>
            <button class="btn btn-small btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

function openUserModal() {
  currentEditingId = null;
  document.getElementById('user-modal-title').textContent = 'Add User';
  document.getElementById('user-form').reset();
  document.getElementById('user-password').required = true;
  document.getElementById('user-modal').classList.add('active');
}

function closeUserModal() {
  document.getElementById('user-modal').classList.remove('active');
  currentEditingId = null;
}

function editUser(id, email, name, role) {
  currentEditingId = id;
  document.getElementById('user-modal-title').textContent = 'Edit User';
  document.getElementById('user-email').value = email;
  document.getElementById('user-name').value = name;
  document.getElementById('user-role').value = role;
  document.getElementById('user-password').value = '';
  document.getElementById('user-password').required = false;
  document.getElementById('user-password').placeholder = 'Leave empty to keep current password';
  document.getElementById('user-modal').classList.add('active');
}

async function handleUserSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');

  const data = {
    email: document.getElementById('user-email').value,
    name: document.getElementById('user-name').value,
    role: document.getElementById('user-role').value
  };

  const password = document.getElementById('user-password').value;
  if (password) data.password = password;

  try {
    const url = currentEditingId ? `/api/users/${currentEditingId}` : '/api/users';
    const method = currentEditingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      closeUserModal();
      loadUsers();
      loadDashboard();
    } else {
      alert('Error saving user');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Error saving user');
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      loadUsers();
      loadDashboard();
    } else {
      alert('Error deleting user');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Error deleting user');
  }
}

// Link Management
async function loadLinks() {
  const token = localStorage.getItem('token');
  try {
    const links = await fetch('/api/links', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());

    const tbody = document.getElementById('links-table');
    tbody.innerHTML = links.map(link => `
      <tr>
        <td>${link.name}</td>
        <td><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.url}</a></td>
        <td>${link.description}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-small" onclick="editLink('${link.id}', '${link.name.replace(/'/g, "\\'")}', '${link.url}', '${link.description.replace(/'/g, "\\'")}')">Edit</button>
            <button class="btn btn-small btn-danger" onclick="deleteLink('${link.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading links:', err);
  }
}

function openLinkModal() {
  currentEditingId = null;
  document.getElementById('link-modal-title').textContent = 'Add Link';
  document.getElementById('link-form').reset();
  document.getElementById('link-modal').classList.add('active');
}

function closeLinkModal() {
  document.getElementById('link-modal').classList.remove('active');
  currentEditingId = null;
}

function editLink(id, name, url, description) {
  currentEditingId = id;
  document.getElementById('link-modal-title').textContent = 'Edit Link';
  document.getElementById('link-name').value = name;
  document.getElementById('link-url').value = url;
  document.getElementById('link-description').value = description;
  document.getElementById('link-modal').classList.add('active');
}

async function handleLinkSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');

  const data = {
    name: document.getElementById('link-name').value,
    url: document.getElementById('link-url').value,
    description: document.getElementById('link-description').value
  };

  try {
    const url = currentEditingId ? `/api/links/${currentEditingId}` : '/api/links';
    const method = currentEditingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      closeLinkModal();
      loadLinks();
      loadDashboard();
    } else {
      alert('Error saving link');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Error saving link');
  }
}

async function deleteLink(id) {
  if (!confirm('Are you sure you want to delete this link?')) return;

  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`/api/links/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      loadLinks();
      loadDashboard();
    } else {
      alert('Error deleting link');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Error deleting link');
  }
}

// Service Management
async function loadServices() {
  const token = localStorage.getItem('token');
  try {
    const services = await fetch('/api/services', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());

    const tbody = document.getElementById('services-table');
    tbody.innerHTML = services.map(service => `
      <tr>
        <td>${service.icon}</td>
        <td>${service.name}</td>
        <td>${service.description}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-small" onclick="editService('${service.id}', '${service.name.replace(/'/g, "\\'")}', '${service.description.replace(/'/g, "\\'")}', '${service.icon}')">Edit</button>
            <button class="btn btn-small btn-danger" onclick="deleteService('${service.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading services:', err);
  }
}

function openServiceModal() {
  currentEditingId = null;
  document.getElementById('service-modal-title').textContent = 'Add Service';
  document.getElementById('service-form').reset();
  document.getElementById('service-icon').value = '🔗';
  document.getElementById('service-modal').classList.add('active');
}

function closeServiceModal() {
  document.getElementById('service-modal').classList.remove('active');
  currentEditingId = null;
}

function editService(id, name, description, icon) {
  currentEditingId = id;
  document.getElementById('service-modal-title').textContent = 'Edit Service';
  document.getElementById('service-name').value = name;
  document.getElementById('service-description').value = description;
  document.getElementById('service-icon').value = icon;
  document.getElementById('service-modal').classList.add('active');
}

async function handleServiceSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');

  const data = {
    name: document.getElementById('service-name').value,
    description: document.getElementById('service-description').value,
    icon: document.getElementById('service-icon').value
  };

  try {
    const url = currentEditingId ? `/api/services/${currentEditingId}` : '/api/services';
    const method = currentEditingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      closeServiceModal();
      loadServices();
      loadDashboard();
    } else {
      alert('Error saving service');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Error saving service');
  }
}

async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;

  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      loadServices();
      loadDashboard();
    } else {
      alert('Error deleting service');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Error deleting service');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

function goToProfile() {
  window.location.href = '/profile';
}
