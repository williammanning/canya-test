import { initialize } from 'https://cdn.jsdelivr.net/npm/launchdarkly-js-client-sdk@3.9.0/+esm';
import Observability from 'https://cdn.jsdelivr.net/npm/@launchdarkly/observability@1.0.0/+esm';
import SessionReplay from 'https://cdn.jsdelivr.net/npm/@launchdarkly/session-replay@1.0.0/+esm';

const clientSideID = '698a9d6da872e60a1a37c8fa';
const context = {
  kind: 'user',
  key: 'user123',
  name: 'Test User'
};

// Known feature flags in the application
const KNOWN_FLAGS = [
  'featured-resources',
  'enable-chatbot-for-help',
  'canya-chatbot-assistant',
  'featured-links-frame'
];

// AI Config flag keys (JSON flags used for AI configuration)
const AI_CONFIG_FLAGS = [
  'canya-chatbot-assistant'
];

let ldclient;
let connectionStartTime;
let trackedEvents = [];

// Initialize LaunchDarkly client with Observability plugins
async function initializeLaunchDarkly() {
  connectionStartTime = Date.now();
  updateConnectionStatus('connecting', 'Connecting...');
  
  try {
    ldclient = initialize(clientSideID, context, {
      plugins: [
        new Observability({
          networkRecording: {
            enabled: true,
            recordHeadersAndBody: true
          }
        }),
        new SessionReplay({
          serviceName: 'ld-test'
        })
      ]
    });
    
    // Wait for initialization with timeout
    await ldclient.waitForInitialization(5000);
    
    const connectionTime = Date.now() - connectionStartTime;
    updateConnectionStatus('connected', `Connected (${connectionTime}ms)`);
    
    // Update SDK info
    updateSDKInfo();
    
    // Load all feature flags
    await loadFeatureFlags();
    
    // Load AI configs
    await loadAIConfigs();
    
    // Set up listeners for flag changes
    setupFlagListeners();
    
    // Track page view event
    trackEvent('ld-status-page-view', {
      timestamp: new Date().toISOString(),
      userKey: context.key
    });
    
    console.log('✅ LaunchDarkly Status Page: Successfully initialized');
    
  } catch (error) {
    console.error('❌ LaunchDarkly Status Page: Initialization failed', error);
    updateConnectionStatus('error', `Connection Error: ${error.message}`);
  }
}

// Update connection status UI
function updateConnectionStatus(status, message) {
  const statusElement = document.getElementById('connection-status');
  const statusDot = statusElement.querySelector('.status-dot');
  
  // Remove all status classes
  statusElement.classList.remove('status-connecting', 'status-connected', 'status-error');
  statusDot.classList.remove('connecting', 'connected', 'error');
  
  // Add appropriate classes
  statusElement.classList.add(`status-${status}`);
  statusDot.classList.add(status);
  
  // Update text
  statusElement.innerHTML = `
    <span class="status-dot ${status}"></span>
    ${message}
  `;
  
  updateLastUpdated();
}

// Update SDK information
function updateSDKInfo() {
  const contextInfo = ldclient.getContext();
  
  document.getElementById('client-id').textContent = clientSideID;
  document.getElementById('user-context').textContent = contextInfo.key || 'Unknown';
}

// Load and display AI config flags
async function loadAIConfigs() {
  const aiContainer = document.getElementById('ai-configs-container');
  aiContainer.innerHTML = '';
  
  const allFlags = ldclient.allFlags();
  const aiConfigKeys = AI_CONFIG_FLAGS.filter(key => allFlags[key] !== undefined);
  
  if (aiConfigKeys.length === 0) {
    aiContainer.innerHTML = '<div class="no-flags">No AI configurations found</div>';
    document.getElementById('ai-count').textContent = '0';
    return;
  }
  
  aiConfigKeys.forEach(flagKey => {
    const flagValue = allFlags[flagKey];
    const flagCard = createFlagCard(flagKey, flagValue);
    flagCard.classList.add('ai-config-card');
    aiContainer.appendChild(flagCard);
  });
  
  document.getElementById('ai-count').textContent = aiConfigKeys.length;
  console.log(`🤖 Loaded ${aiConfigKeys.length} AI configurations`);
}

// Load and display all feature flags
async function loadFeatureFlags() {
  const flagsContainer = document.getElementById('flags-container');
  flagsContainer.innerHTML = '';
  
  // Get all flags from the client
  const allFlags = ldclient.allFlags();
  const flagKeys = Object.keys(allFlags);
  
  if (flagKeys.length === 0) {
    flagsContainer.innerHTML = '<div class="no-flags">No feature flags found</div>';
    document.getElementById('flags-count').textContent = '0';
    return;
  }
  
  // Filter out AI config flags from regular flags
  const regularFlags = flagKeys.filter(key => !AI_CONFIG_FLAGS.includes(key));
  
  // Add known flags first, then any additional flags
  const displayFlags = [...new Set([...KNOWN_FLAGS.filter(k => !AI_CONFIG_FLAGS.includes(k)), ...regularFlags])];
  
  displayFlags.forEach(flagKey => {
    const flagValue = allFlags[flagKey];
    
    // Skip if the flag doesn't exist
    if (flagValue === undefined) {
      return;
    }
    
    const flagCard = createFlagCard(flagKey, flagValue);
    flagsContainer.appendChild(flagCard);
  });
  
  document.getElementById('flags-count').textContent = displayFlags.length;
  updateLastUpdated();
  console.log(`📊 Loaded ${displayFlags.length} feature flags`);
}

// Create a flag card element
function createFlagCard(flagKey, flagValue) {
  const card = document.createElement('div');
  card.className = 'flag-card';
  card.id = `flag-${flagKey}`;
  
  const valueType = typeof flagValue;
  const isObject = valueType === 'object' && flagValue !== null;
  const displayValue = isObject ? 'JSON Object' : String(flagValue);
  
  let valueClass = '';
  if (valueType === 'boolean') {
    valueClass = flagValue ? 'boolean-true' : 'boolean-false';
  } else if (valueType === 'string') {
    valueClass = 'string';
  } else if (valueType === 'number') {
    valueClass = 'number';
  } else if (isObject) {
    valueClass = 'json';
  }
  
  card.innerHTML = `
    <div class="flag-header">
      <div class="flag-key">${flagKey}</div>
      <div class="flag-value ${valueClass}">${displayValue}</div>
    </div>
    <div class="flag-details">
      <div class="flag-type">Type: ${isObject ? 'Object' : valueType}</div>
      ${isObject ? `
        <pre class="flag-json">${JSON.stringify(flagValue, null, 2)}</pre>
      ` : `
        <div class="flag-json">Value: ${JSON.stringify(flagValue)}</div>
      `}
    </div>
  `;
  
  return card;
}

// Set up listeners for flag changes
function setupFlagListeners() {
  ldclient.on('change', (changes) => {
    console.log('🔄 Flag values changed:', changes);
    
    // Track flag change event
    Object.keys(changes).forEach(flagKey => {
      trackEvent('flag-changed', {
        flagKey: flagKey,
        oldValue: changes[flagKey].previous,
        newValue: changes[flagKey].current,
        timestamp: new Date().toISOString()
      });
    });
    
    // Reload all flags when any change occurs
    loadFeatureFlags();
    loadAIConfigs();
    
    // Show a visual indicator that something changed
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.textContent = 'Updated!';
    setTimeout(() => {
      refreshButton.textContent = 'Refresh';
    }, 2000);
  });
}

// Update last updated timestamp
function updateLastUpdated() {
  const lastUpdatedElement = document.getElementById('last-updated');
  const now = new Date();
  lastUpdatedElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Track custom events
function trackEvent(eventName, eventData) {
  if (!ldclient) return;
  
  try {
    ldclient.track(eventName, eventData);
    ldclient.flush();
    
    // Add to local event log
    const event = {
      name: eventName,
      data: eventData,
      timestamp: new Date()
    };
    
    trackedEvents.unshift(event);
    if (trackedEvents.length > 20) {
      trackedEvents = trackedEvents.slice(0, 20);
    }
    
    updateEventsDisplay();
    console.log('📊 Tracked event:', eventName, eventData);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Update events display
function updateEventsDisplay() {
  const eventsContainer = document.getElementById('events-container');
  
  if (trackedEvents.length === 0) {
    eventsContainer.innerHTML = '<div class="no-flags">No events tracked yet. Events will appear here as they occur.</div>';
    document.getElementById('event-count').textContent = '0';
    return;
  }
  
  eventsContainer.innerHTML = trackedEvents.map(event => `
    <div class="event-item">
      <div class="event-header">
        <div class="event-name">${event.name}</div>
        <div class="event-time">${event.timestamp.toLocaleTimeString()}</div>
      </div>
      <div class="event-data">${JSON.stringify(event.data, null, 2)}</div>
    </div>
  `).join('');
  
  document.getElementById('event-count').textContent = trackedEvents.length;
}

// Clear events
window.clearEvents = function() {
  trackedEvents = [];
  updateEventsDisplay();
  trackEvent('events-cleared', { timestamp: new Date().toISOString() });
};

// Refresh flags manually
window.refreshFlags = async function() {
  const refreshButton = document.getElementById('refresh-button');
  refreshButton.disabled = true;
  refreshButton.textContent = 'Refreshing...';
  
  try {
    await loadFeatureFlags();
    await loadAIConfigs();
    trackEvent('manual-refresh', { timestamp: new Date().toISOString() });
    refreshButton.textContent = 'Refreshed!';
    setTimeout(() => {
      refreshButton.textContent = 'Refresh';
      refreshButton.disabled = false;
    }, 1000);
  } catch (error) {
    console.error('Error refreshing flags:', error);
    refreshButton.textContent = 'Error!';
    setTimeout(() => {
      refreshButton.textContent = 'Refresh';
      refreshButton.disabled = false;
    }, 2000);
  }
};

// Initialize on page load
initializeLaunchDarkly();

// Export client for console debugging
window.ldStatusClient = ldclient;

console.log('💡 LaunchDarkly Status Page loaded');
console.log('💡 Available commands:');
console.log('   - window.refreshFlags() - Manually refresh flag values');
console.log('   - window.ldStatusClient - Access LaunchDarkly client directly');
