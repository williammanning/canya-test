// Theme management for Canya
(function() {
    'use strict';
    
    const THEME_KEY = 'canya-theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';
    
    // Get saved theme or default to dark
    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY) || THEME_DARK;
    }
    
    // Save theme preference
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
    
    // Apply theme to document
    function applyTheme(theme) {
        if (theme === THEME_LIGHT) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
    
    // Toggle between themes
    function toggleTheme() {
        const currentTheme = getSavedTheme();
        const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
        
        saveTheme(newTheme);
        applyTheme(newTheme);
        updateThemeButton(newTheme);
        
        console.log(`Theme switched to: ${newTheme}`);
    }
    
    // Update the theme toggle button icon
    function updateThemeButton(theme) {
        const button = document.getElementById('theme-toggle');
        if (button) {
            button.textContent = theme === THEME_DARK ? '☀️' : '🌙';
            button.setAttribute('aria-label', 
                theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode'
            );
            button.setAttribute('title', 
                theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode'
            );
        }
    }
    
    // Initialize theme on page load
    function initTheme() {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);
        updateThemeButton(savedTheme);
    }
    
    // Set up theme toggle button
    function setupThemeToggle() {
        const button = document.getElementById('theme-toggle');
        if (button) {
            button.addEventListener('click', toggleTheme);
        }
    }
    
    // Initialize immediately (before DOM loads) to prevent flash
    initTheme();
    
    // Set up button after DOM loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupThemeToggle);
    } else {
        setupThemeToggle();
    }
    
    // Export for console debugging
    window.themeManager = {
        toggle: toggleTheme,
        set: function(theme) {
            if (theme === THEME_LIGHT || theme === THEME_DARK) {
                saveTheme(theme);
                applyTheme(theme);
                updateThemeButton(theme);
            } else {
                console.error('Invalid theme. Use "light" or "dark"');
            }
        },
        get: getSavedTheme
    };
    
    console.log('🎨 Theme manager initialized. Current theme:', getSavedTheme());
    console.log('💡 Available commands:');
    console.log('   - themeManager.toggle() - Toggle between light and dark');
    console.log('   - themeManager.set("light" | "dark") - Set specific theme');
    console.log('   - themeManager.get() - Get current theme');
})();
