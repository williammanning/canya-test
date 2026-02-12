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
  } catch (error) {
    console.error('Initialization failed', error);
  }
})();
