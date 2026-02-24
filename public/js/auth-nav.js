(function () {
  'use strict';

  const getStoredToken = () => localStorage.getItem('token');

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const setUserNav = (user) => {
    const userNameItem = document.getElementById('nav-user-name');
    const authActionItem = document.getElementById('nav-auth-action');
    const adminDashboardItem = document.getElementById('nav-admin-dashboard');

    if (userNameItem) {
      userNameItem.style.display = 'list-item';
      userNameItem.innerHTML = `<a href="/profile" class="nav-user-name">${user.name}</a>`;
    }

    if (authActionItem) {
      authActionItem.innerHTML = '<a href="#" class="admin-link" id="nav-logout-btn">Logout</a>';
      const logoutBtn = document.getElementById('nav-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
          event.preventDefault();
          clearAuth();
          window.location.href = '/';
        });
      }
    }

    if (adminDashboardItem) {
      if (user.role === 'admin') {
        adminDashboardItem.style.display = 'list-item';
      } else {
        adminDashboardItem.style.display = 'none';
      }
    }
  };

  const setLoggedOutNav = () => {
    const userNameItem = document.getElementById('nav-user-name');
    const authActionItem = document.getElementById('nav-auth-action');
    const adminDashboardItem = document.getElementById('nav-admin-dashboard');

    if (userNameItem) {
      userNameItem.style.display = 'none';
      userNameItem.innerHTML = '';
    }

    if (authActionItem) {
      authActionItem.innerHTML = '<a href="/login" class="admin-link">Login</a>';
    }

    if (adminDashboardItem) {
      adminDashboardItem.style.display = 'none';
    }
  };

  const verifyAndUpdateNav = async () => {
    const token = getStoredToken();
    if (!token) {
      setLoggedOutNav();
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        clearAuth();
        setLoggedOutNav();
        return;
      }

      const data = await response.json();
      if (!data.valid || !data.user) {
        clearAuth();
        setLoggedOutNav();
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setUserNav(data.user);
    } catch (error) {
      setLoggedOutNav();
      console.error('Auth navigation error:', error);
    }
  };

  window.logout = () => {
    clearAuth();
    window.location.href = '/';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verifyAndUpdateNav);
  } else {
    verifyAndUpdateNav();
  }
})();
