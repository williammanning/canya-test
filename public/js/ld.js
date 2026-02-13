import { initialize } from 'https://cdn.jsdelivr.net/npm/launchdarkly-js-client-sdk@3.9.0/+esm';
import Observability from 'https://cdn.jsdelivr.net/npm/@launchdarkly/observability@1.0.0/+esm';
import SessionReplay from 'https://cdn.jsdelivr.net/npm/@launchdarkly/session-replay@1.0.0/+esm';

const clientSideID = '698a9d6da872e60a1a37c8fa';
const context = {
  kind: 'user',
  key: 'user123',
  name: 'Test User'
};

const ldclient = initialize(clientSideID, context, {
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

(async () => {
  try {
    await ldclient.waitForInitialization(4000);
    console.log('SDK successfully initialized!');
    
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
}

// Export the client for use in other scripts if needed
window.ldclient = ldclient;
