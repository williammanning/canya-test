import { LDClient } from 'launchdarkly-js-client-sdk'
import Observability, { LDObserve } from '@launchdarkly/observability'
import SessionReplay, { LDRecord } from '@launchdarkly/session-replay'

const client = LDClient.initialize('6980ef02dc8a2b0a09c57945', {
  // … your existing config, if relevant
  plugins: [
    new Observability({
      networkRecording: {
        enabled: true,
        recordHeadersAndBody: true
      }
    }),
    new SessionReplay({
      // Use 'none' to turn off session replay obfuscation. To learn more, read: https://launchdarkly.com/docs/sdk/features/session-replay-config#privacy
      privacySetting: 'strict'
    })
  ],
});
