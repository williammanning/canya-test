import { initialize } from 'https://cdn.jsdelivr.net/npm/launchdarkly-js-client-sdk@3.9.0/+esm';
import Observability from 'https://cdn.jsdelivr.net/npm/@launchdarkly/observability@1.0.0/+esm';
import SessionReplay from 'https://cdn.jsdelivr.net/npm/@launchdarkly/session-replay@1.0.0/+esm';

const clientSideID = '698a9d6da872e60a1a37c8fa';
const fallbackContext = {
  kind: 'user',
  key: 'user123',
  name: 'Test User',
  anonymous: true,
  registeredUser: false
};

const DEFAULT_CHATBOT_AI_CONFIG = {
  enabled: true,
  model: 'gemini-3-flash-preview',
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt: 'You are a helpful assistant for Canya, a community services and resources platform. Help users with questions about community services, environmental conservation, social justice, and community development.'
};

let ldclient;
let pendingFlush = false;

function safeFlush() {
  if (!ldclient || pendingFlush) {
    return;
  }

  pendingFlush = true;
  setTimeout(() => {
    try {
      ldclient.flush();
    } finally {
      pendingFlush = false;
    }
  }, 500);
}

function normalizeText(value, maxLength = 120) {
  if (!value) {
    return '';
  }

  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function getCurrentUserMetadata(contextInfo) {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    userId: contextInfo?.key || storedUser.id || null,
    email: contextInfo?.email || storedUser.email || null,
    name: contextInfo?.name || storedUser.name || null,
    role: contextInfo?.role || storedUser.role || null,
    registeredUser: contextInfo?.registeredUser === true
  };
}

function trackUserEvent(eventName, data = {}) {
  if (!ldclient) {
    return;
  }

  ldclient.track(eventName, {
    ...data,
    path: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  safeFlush();
}

function setupUserObservability(contextInfo) {
  const userMetadata = getCurrentUserMetadata(contextInfo);

  trackUserEvent('user-session-started', {
    ...userMetadata,
    referrer: document.referrer || null,
    userAgent: navigator.userAgent
  });

  trackUserEvent('user-data-snapshot', userMetadata);

  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button, [role="button"], input[type="submit"]');
    if (!target) {
      return;
    }

    trackUserEvent('user-action-click', {
      ...userMetadata,
      tag: target.tagName,
      id: target.id || null,
      classes: target.className || null,
      text: normalizeText(target.textContent || target.value),
      href: target.getAttribute('href') || null
    });
  }, true);

  document.addEventListener('submit', (event) => {
    const form = event.target;
    trackUserEvent('user-action-submit', {
      ...userMetadata,
      formId: form.id || null,
      formAction: form.getAttribute('action') || null,
      formMethod: form.getAttribute('method') || 'get'
    });
  }, true);

  window.addEventListener('beforeunload', () => {
    trackUserEvent('user-session-ended', userMetadata);
  });

  window.addEventListener('error', (event) => {
    trackUserEvent('user-runtime-error', {
      ...userMetadata,
      message: normalizeText(event.message, 300),
      source: event.filename || null,
      line: event.lineno || null,
      column: event.colno || null
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackUserEvent('user-unhandled-rejection', {
      ...userMetadata,
      reason: normalizeText(event.reason?.message || event.reason, 300)
    });
  });

  window.trackUserAction = (action, details = {}) => {
    trackUserEvent('user-action-custom', {
      ...userMetadata,
      action,
      details
    });
  };
}

function resolveChatbotAIConfig(flagValue) {
  if (!flagValue || typeof flagValue !== 'object') {
    return { ...DEFAULT_CHATBOT_AI_CONFIG };
  }

  const merged = {
    ...DEFAULT_CHATBOT_AI_CONFIG,
    ...flagValue
  };

  const temperature = Number(merged.temperature);
  const maxTokens = Number(merged.maxTokens);

  return {
    enabled: typeof merged.enabled === 'boolean' ? merged.enabled : DEFAULT_CHATBOT_AI_CONFIG.enabled,
    model: merged.model || DEFAULT_CHATBOT_AI_CONFIG.model,
    temperature: Number.isFinite(temperature) ? temperature : DEFAULT_CHATBOT_AI_CONFIG.temperature,
    maxTokens: Number.isFinite(maxTokens) ? maxTokens : DEFAULT_CHATBOT_AI_CONFIG.maxTokens,
    systemPrompt: merged.systemPrompt || DEFAULT_CHATBOT_AI_CONFIG.systemPrompt
  };
}

async function getLaunchDarklyContext() {
  const token = localStorage.getItem('token');
  if (!token) {
    return fallbackContext;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return fallbackContext;
    }

    const data = await response.json();
    if (!data.valid || !data.user) {
      return fallbackContext;
    }

    const user = data.user;
    return {
      kind: 'user',
      key: user.id || user.email || user.name || 'authenticated-user',
      name: user.name || 'Authenticated User',
      email: user.email,
      role: user.role,
      anonymous: false,
      registeredUser: true
    };
  } catch (error) {
    console.error('Failed to resolve LaunchDarkly user context:', error);
    return fallbackContext;
  }
}

(async () => {
  try {
    const context = await getLaunchDarklyContext();
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

    window.ldclient = ldclient;

    await ldclient.waitForInitialization(4000);
    console.log('SDK successfully initialized!');
    
    // Verify context is set correctly
    const contextInfo = ldclient.getContext();
    console.log('🔑 LaunchDarkly Context:', contextInfo);

    setupUserObservability(contextInfo);
    
    // Evaluate feature flags
    evaluateFlags();
  } catch (error) {
    console.error('Initialization failed', error);
  }
})();

function evaluateFlags() {
  // Check featured-resources flag
  const featuredResourcesEnabled = ldclient.variation('featured-resources', false);
  const featuredSection = document.querySelector('[data-ld-flag-key="featured-links-frame"]');
  
  if (featuredSection) {
    featuredSection.style.display = featuredResourcesEnabled ? 'block' : 'none';
  }
  
  // Listen for flag changes
  ldclient.on('change:featured-resources', (newValue) => {
    if (featuredSection) {
      featuredSection.style.display = newValue ? 'block' : 'none';
    }
  });

  // Check enable-chatbot-for-help flag
  const chatbotEnabled = ldclient.variation('enable-chatbot-for-help', false);
  const chatbotSection = document.querySelector('[data-ld-flag-key="enable-chatbot-for-help"]');
  
  if (chatbotSection) {
    chatbotSection.style.display = chatbotEnabled ? 'block' : 'none';
  }
  
  // Listen for chatbot flag changes
  ldclient.on('change:enable-chatbot-for-help', (newValue) => {
    if (chatbotSection) {
      chatbotSection.style.display = newValue ? 'block' : 'none';
    }
  });

  // Get AI Config for chatbot
  const rawAiConfig = ldclient.variation('canya-chatbot-assistant', DEFAULT_CHATBOT_AI_CONFIG);
  const aiConfig = resolveChatbotAIConfig(rawAiConfig);
  
  // Store AI config globally for chatbot to use
  window.chatbotAIConfig = aiConfig;
  
  // Test AI Config connection
  console.log('✅ LaunchDarkly AI Config (canya-chatbot-assistant) loaded:', aiConfig);
  console.log('  Model:', aiConfig.model);
  console.log('  Temperature:', aiConfig.temperature);
  console.log('  Max Tokens:', aiConfig.maxTokens);
  console.log('  Enabled:', aiConfig.enabled);
  
  // Track AI Config usage in LaunchDarkly
  trackUserEvent('ai-config-loaded', {
    configKey: 'canya-chatbot-assistant',
    model: aiConfig.model,
    temperature: aiConfig.temperature,
    maxTokens: aiConfig.maxTokens,
    enabled: aiConfig.enabled
  });
  
  console.log('📊 LaunchDarkly tracking event sent: ai-config-loaded');
  console.log('💡 To see this data in LaunchDarkly:');
  console.log('   1. Go to your LaunchDarkly dashboard');
  console.log('   2. Navigate to Experimentation > Events or Insights');
  console.log('   3. Look for custom events: "ai-config-loaded", "chatbot-message-sent"');
  console.log('   4. Check Flag evaluations for "canya-chatbot-assistant"');
  console.log('   5. Ensure your project has the correct client-side ID:', clientSideID);
  
  // Listen for AI config changes
  ldclient.on('change:canya-chatbot-assistant', (newConfig) => {
    const normalizedConfig = resolveChatbotAIConfig(newConfig);
    window.chatbotAIConfig = normalizedConfig;
    console.log('🔄 Chatbot AI config updated:', normalizedConfig);
    
    // Track config changes
    trackUserEvent('ai-config-changed', {
      configKey: 'canya-chatbot-assistant',
      newModel: normalizedConfig.model,
      newTemperature: normalizedConfig.temperature,
      newMaxTokens: normalizedConfig.maxTokens,
      enabled: normalizedConfig.enabled
    });
  });
}

// Expose test function to verify AI config in console
window.testLDAIConfig = function() {
  if (!ldclient) {
    console.log('LaunchDarkly client not initialized yet. Please try again in a moment.');
    return;
  }

  console.log('🧪 Testing LaunchDarkly AI Config Connection...');
  console.log('');
  console.log('Current AI Config:', window.chatbotAIConfig);
  console.log('');
  console.log('LaunchDarkly Context:', ldclient.getContext());
  console.log('');
  
  // Get the variation with details
  const testConfig = ldclient.variation('canya-chatbot-assistant', {});
  console.log('Fresh AI Config fetch:', testConfig);
  console.log('');
  
  // Send test event
  trackUserEvent('test-ai-config-connection', {
    timestamp: new Date().toISOString(),
    testPassed: !!testConfig
  });
  
  console.log('✅ Test event sent to LaunchDarkly');
  console.log('📊 Check your LaunchDarkly dashboard in a few moments');
  console.log('   Expected events: "test-ai-config-connection", "ai-config-loaded"');
  console.log('   Expected flag: "canya-chatbot-assistant"');
};

console.log('💡 Run testLDAIConfig() in console to verify LaunchDarkly AI Config');
