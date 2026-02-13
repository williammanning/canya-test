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
    
    // Verify context is set correctly
    const contextInfo = ldclient.getContext();
    console.log('🔑 LaunchDarkly Context:', contextInfo);
    
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
  const aiConfig = ldclient.variation('canya-chatbot-assistant', {
    enabled: true,
    model: 'gemini-3-flash-preview',
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: 'You are a helpful assistant for Canya, a community services and resources platform. Help users with questions about community services, environmental conservation, social justice, and community development.'
  });
  
  // Store AI config globally for chatbot to use
  window.chatbotAIConfig = aiConfig;
  
  // Test AI Config connection
  console.log('✅ LaunchDarkly AI Config (canya-chatbot-assistant) loaded:', aiConfig);
  console.log('  Model:', aiConfig.model);
  console.log('  Temperature:', aiConfig.temperature);
  console.log('  Max Tokens:', aiConfig.maxTokens);
  console.log('  Enabled:', aiConfig.enabled);
  
  // Track AI Config usage in LaunchDarkly
  ldclient.track('ai-config-loaded', {
    configKey: 'canya-chatbot-assistant',
    model: aiConfig.model,
    temperature: aiConfig.temperature,
    maxTokens: aiConfig.maxTokens,
    enabled: aiConfig.enabled
  });
  
  // Flush events to ensure LaunchDarkly receives them immediately
  ldclient.flush();
  
  console.log('📊 LaunchDarkly tracking event sent: ai-config-loaded');
  console.log('💡 To see this data in LaunchDarkly:');
  console.log('   1. Go to your LaunchDarkly dashboard');
  console.log('   2. Navigate to Experimentation > Events or Insights');
  console.log('   3. Look for custom events: "ai-config-loaded", "chatbot-message-sent"');
  console.log('   4. Check Flag evaluations for "canya-chatbot-assistant"');
  console.log('   5. Ensure your project has the correct client-side ID:', clientSideID);
  
  // Listen for AI config changes
  ldclient.on('change:canya-chatbot-assistant', (newConfig) => {
    window.chatbotAIConfig = newConfig;
    console.log('🔄 Chatbot AI config updated:', newConfig);
    
    // Track config changes
    ldclient.track('ai-config-changed', {
      configKey: 'canya-chatbot-assistant',
      newModel: newConfig.model,
      newTemperature: newConfig.temperature,
      newMaxTokens: newConfig.maxTokens
    });
    ldclient.flush();
  });
}

// Export the client for use in other scripts if needed
window.ldclient = ldclient;

// Expose test function to verify AI config in console
window.testLDAIConfig = function() {
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
  ldclient.track('test-ai-config-connection', {
    timestamp: new Date().toISOString(),
    testPassed: !!testConfig
  });
  ldclient.flush();
  
  console.log('✅ Test event sent to LaunchDarkly');
  console.log('📊 Check your LaunchDarkly dashboard in a few moments');
  console.log('   Expected events: "test-ai-config-connection", "ai-config-loaded"');
  console.log('   Expected flag: "canya-chatbot-assistant"');
};

console.log('💡 Run testLDAIConfig() in console to verify LaunchDarkly AI Config');
