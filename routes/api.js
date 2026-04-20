import express from 'express';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { readData, writeData } from '../middleware/db.js';
import { verifyToken } from '../middleware/auth.js';

const DEFAULT_CHATBOT_AI_CONFIG = {
  enabled: true,
  model: 'gemini-3-flash-preview',
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt: 'You are a helpful assistant for Canya, a community services and resources platform. Help users with questions about community services, environmental conservation, social justice, and community development.'
};

function normalizeChatbotConfig(config) {
  const source = config && typeof config === 'object' ? config : {};
  const modelName = typeof source.model === 'string'
    ? source.model
    : (typeof source.model?.name === 'string' ? source.model.name : DEFAULT_CHATBOT_AI_CONFIG.model);
  const temperature = Number(source.temperature ?? source.model?.parameters?.temperature);
  const maxTokens = Number(source.maxTokens ?? source.model?.parameters?.maxTokens);

  let systemPrompt = source.systemPrompt;
  if (!systemPrompt && Array.isArray(source.messages)) {
    const systemMessage = source.messages.find((message) => {
      if (message?.role !== 'system') {
        return false;
      }

      if (typeof message.content === 'string' && message.content.trim()) {
        return true;
      }

      if (Array.isArray(message.content) && message.content.length > 0) {
        return true;
      }

      return false;
    });

    if (typeof systemMessage?.content === 'string') {
      systemPrompt = systemMessage.content;
    } else if (Array.isArray(systemMessage?.content)) {
      const textPart = systemMessage.content.find((part) => typeof part?.text === 'string' && part.text.trim());
      systemPrompt = textPart?.text;
    }
  }

  return {
    enabled: typeof source.enabled === 'boolean' ? source.enabled : DEFAULT_CHATBOT_AI_CONFIG.enabled,
    model: modelName || DEFAULT_CHATBOT_AI_CONFIG.model,
    temperature: Number.isFinite(temperature) ? temperature : DEFAULT_CHATBOT_AI_CONFIG.temperature,
    maxTokens: Number.isFinite(maxTokens) ? maxTokens : DEFAULT_CHATBOT_AI_CONFIG.maxTokens,
    systemPrompt: systemPrompt || DEFAULT_CHATBOT_AI_CONFIG.systemPrompt,
    tracker: source.tracker
  };
}

function resolveAIConfigSourceFromTracker(ldResolvedConfig, ldAIConfigKey) {
  const tracker = ldResolvedConfig?.tracker;
  if (!tracker || typeof tracker.trackMetricsOf !== 'function') {
    return 'ai-config-no-tracker';
  }

  const trackData = typeof tracker.getTrackData === 'function'
    ? tracker.getTrackData()
    : null;

  const variationKey = trackData?.variationKey;
  const configKey = trackData?.configKey;

  if (!configKey || configKey !== ldAIConfigKey) {
    return 'ai-config-no-tracker';
  }

  if (!variationKey) {
    return 'ai-config-key-not-found';
  }

  return 'launchdarkly-ai-sdk';
}

function summarizeAIConfigResolution(ldResolvedConfig, requestedAIConfigKey) {
  const tracker = ldResolvedConfig?.tracker;
  const trackData = tracker && typeof tracker.getTrackData === 'function'
    ? tracker.getTrackData()
    : null;
  const model = ldResolvedConfig?.model;
  const modelName = typeof model === 'string'
    ? model
    : (typeof model?.name === 'string' ? model.name : null);
  const providerName = typeof model?.provider?.name === 'string'
    ? model.provider.name
    : null;
  const messages = Array.isArray(ldResolvedConfig?.messages) ? ldResolvedConfig.messages : [];

  return {
    requestedKey: requestedAIConfigKey || null,
    trackerAvailable: !!tracker,
    trackerHasData: !!trackData,
    returnedConfigKey: trackData?.configKey || null,
    variationKey: trackData?.variationKey || null,
    version: typeof trackData?.version === 'number' ? trackData.version : null,
    modelName,
    providerName,
    messageCount: messages.length,
    hasSystemMessage: messages.some((message) => message?.role === 'system')
  };
}

async function resolveChatbotRuntimeConfig(req, incomingConfig) {
  const fallbackConfig = normalizeChatbotConfig(incomingConfig || DEFAULT_CHATBOT_AI_CONFIG);
  let resolvedConfig = fallbackConfig;
  let configSource = 'request-fallback';
  let sdkResolution = summarizeAIConfigResolution(fallbackConfig, null);

  const ldAiClient = req.app.locals.ldAiClient;
  const envAIConfigKey = (process.env.LAUNCHDARKLY_CHATBOT_AI_CONFIG_KEY || '').trim();
  const localAIConfigKey = (req.app.locals.ldAIConfigKey || '').trim();
  const ldAIConfigKey = envAIConfigKey || localAIConfigKey;
  const ldAIConfigState = req.app.locals.ldAIConfigState || (req.app.locals.ldAIConfigState = { missingKeys: new Set() });

  if (!ldAIConfigKey) {
    return {
      resolvedConfig,
      configSource: 'ai-config-key-not-set',
      ldAIConfigKey: null,
      sdkResolution
    };
  }

  const headerUserKey = req.headers['x-user-key'];
  const resolvedKey = Array.isArray(headerUserKey) ? headerUserKey[0] : headerUserKey;
  const context = {
    kind: 'user',
    key: String(resolvedKey || req.ip || 'anonymous-chat-user'),
    anonymous: true
  };

  if (ldAIConfigState.missingKeys.has(ldAIConfigKey)) {
    return {
      resolvedConfig,
      configSource: 'ai-config-key-not-found',
      ldAIConfigKey,
      sdkResolution: {
        ...sdkResolution,
        requestedKey: ldAIConfigKey
      }
    };
  }

  if (ldAiClient && typeof ldAiClient.completionConfig === 'function') {
    try {
      const ldResolvedConfig = await ldAiClient.completionConfig(
        ldAIConfigKey,
        context,
        fallbackConfig,
        {}
      );

      resolvedConfig = normalizeChatbotConfig(ldResolvedConfig);
      sdkResolution = summarizeAIConfigResolution(ldResolvedConfig, ldAIConfigKey);
      configSource = resolveAIConfigSourceFromTracker(ldResolvedConfig, ldAIConfigKey);
      if (configSource === 'ai-config-key-not-found') {
        ldAIConfigState.missingKeys.add(ldAIConfigKey);
      }
    } catch (error) {
      const errorMessage = String(error?.message || '');
      if (errorMessage.includes('Unknown feature flag')) {
        ldAIConfigState.missingKeys.add(ldAIConfigKey);
        return {
          resolvedConfig,
          configSource: 'ai-config-key-not-found',
          ldAIConfigKey,
          sdkResolution: {
            ...sdkResolution,
            requestedKey: ldAIConfigKey
          }
        };
      }
      console.warn('LaunchDarkly AI config resolution failed, using fallback chatbot config', error?.message || error);
    }
  }

  return {
    resolvedConfig,
    configSource,
    ldAIConfigKey,
    sdkResolution: {
      ...sdkResolution,
      requestedKey: ldAIConfigKey || sdkResolution.requestedKey || null
    }
  };
}

// User Management Routes
router.get('/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const users = readData('users.json');
  res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
});

router.post('/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  const users = readData('users.json');
  
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: uuidv4(),
    email,
    password: bcrypt.hashSync(password, 10),
    name,
    role: role || 'user'
  };

  users.push(newUser);
  writeData('users.json', users);

  res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
});

router.put('/users/:id', verifyToken, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user.id === req.params.id;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { email, password, name, role } = req.body;

  let users = readData('users.json');
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (email) users[userIndex].email = email;
  if (password) users[userIndex].password = bcrypt.hashSync(password, 10);
  if (name) users[userIndex].name = name;
  if (isAdmin && role) users[userIndex].role = role;

  writeData('users.json', users);
  res.json({ id: users[userIndex].id, email: users[userIndex].email, name: users[userIndex].name, role: users[userIndex].role });
});

router.delete('/users/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  let users = readData('users.json');
  
  users = users.filter(u => u.id !== id);
  writeData('users.json', users);

  res.json({ message: 'User deleted' });
});

// Link Management Routes
router.get('/links', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const links = readData('links.json');
  res.json(links);
});

const validateUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

router.post('/links', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { name, url, description } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL required' });
  }

  if (!validateUrl(url)) {
    return res.status(400).json({ error: 'URL must use http or https' });
  }

  const links = readData('links.json');
  const newLink = {
    id: uuidv4(),
    name,
    url,
    description: description || ''
  };

  links.push(newLink);
  writeData('links.json', links);

  res.status(201).json(newLink);
});

router.put('/links/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { name, url, description } = req.body;

  let links = readData('links.json');
  const linkIndex = links.findIndex(l => l.id === id);

  if (linkIndex === -1) {
    return res.status(404).json({ error: 'Link not found' });
  }

  if (name) links[linkIndex].name = name;
  if (url) {
    if (!validateUrl(url)) {
      return res.status(400).json({ error: 'URL must use http or https' });
    }
    links[linkIndex].url = url;
  }
  if (description !== undefined) links[linkIndex].description = description;

  writeData('links.json', links);
  res.json(links[linkIndex]);
});

router.delete('/links/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  let links = readData('links.json');
  
  links = links.filter(l => l.id !== id);
  writeData('links.json', links);

  res.json({ message: 'Link deleted' });
});

// Service Management Routes
router.get('/services', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const services = readData('services.json');
  res.json(services);
});

router.post('/services', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { name, description, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Service name required' });
  }

  const services = readData('services.json');
  const newService = {
    id: uuidv4(),
    name,
    description: description || '',
    icon: icon || '🔗'
  };

  services.push(newService);
  writeData('services.json', services);

  res.status(201).json(newService);
});

router.put('/services/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { name, description, icon } = req.body;

  let services = readData('services.json');
  const serviceIndex = services.findIndex(s => s.id === id);

  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }

  if (name) services[serviceIndex].name = name;
  if (description !== undefined) services[serviceIndex].description = description;
  if (icon) services[serviceIndex].icon = icon;

  writeData('services.json', services);
  res.json(services[serviceIndex]);
});

router.delete('/services/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  let services = readData('services.json');
  
  services = services.filter(s => s.id !== id);
  writeData('services.json', services);

  res.json({ message: 'Service deleted' });
});

router.get('/ld/debug-ai-config', async (req, res) => {
  try {
    const ldClient = req.app.locals.ldClient;
    const envAIConfigKey = (process.env.LAUNCHDARKLY_CHATBOT_AI_CONFIG_KEY || '').trim();
    const localAIConfigKey = (req.app.locals.ldAIConfigKey || '').trim();
    const configuredAIConfigKey = envAIConfigKey || localAIConfigKey || null;

    if (!ldClient || typeof ldClient.allFlagsState !== 'function') {
      return res.status(503).json({
        error: 'LaunchDarkly server client is unavailable',
        configuredAIConfigKey
      });
    }

    const headerUserKey = req.headers['x-user-key'];
    const resolvedKey = Array.isArray(headerUserKey) ? headerUserKey[0] : headerUserKey;
    const context = {
      kind: 'user',
      key: String(resolvedKey || req.ip || 'ld-debug-user'),
      anonymous: true
    };

    const state = await ldClient.allFlagsState(context);
    const allFlags = state?.toJSON?.() || {};
    const visibleKeys = Object.keys(allFlags).sort();

    res.json({
      configuredAIConfigKey,
      configuredKeyVisible: configuredAIConfigKey ? visibleKeys.includes(configuredAIConfigKey) : false,
      visibleKeyCount: visibleKeys.length,
      visibleKeys
    });
  } catch (error) {
    console.error('LaunchDarkly debug endpoint error:', error);
    res.status(500).json({
      error: 'Unable to inspect LaunchDarkly keys',
      details: error?.message || 'Unknown error'
    });
  }
});

router.get('/chatbot/config', async (req, res) => {
  try {
    const { resolvedConfig, configSource, ldAIConfigKey, sdkResolution } = await resolveChatbotRuntimeConfig(req, DEFAULT_CHATBOT_AI_CONFIG);
    res.json({
      configSource,
      checkedAIConfigKey: ldAIConfigKey || null,
      appliedAIConfig: {
        model: resolvedConfig.model,
        temperature: resolvedConfig.temperature,
        maxTokens: resolvedConfig.maxTokens,
        enabled: resolvedConfig.enabled
      },
      sdkResolution
    });
  } catch (error) {
    console.error('Chatbot config endpoint error:', error);
    res.status(500).json({ error: 'Unable to resolve chatbot config' });
  }
});

// Chatbot endpoint - proxy to Gemini API with LaunchDarkly AI Config
router.post('/chatbot', async (req, res) => {
  try {
    const { message, aiConfig } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const { resolvedConfig, configSource, ldAIConfigKey, sdkResolution } = await resolveChatbotRuntimeConfig(req, aiConfig || DEFAULT_CHATBOT_AI_CONFIG);

    const modelName = resolvedConfig.model;
    const temperature = resolvedConfig.temperature;
    const maxTokens = resolvedConfig.maxTokens;
    const systemPrompt = resolvedConfig.systemPrompt;

    if (resolvedConfig.enabled === false) {
      return res.status(503).json({ error: 'AI assistant is disabled by LaunchDarkly configuration' });
    }

    // Test: Log AI config being used
    console.log('🤖 Chatbot request received with AI Config:', {
      model: modelName,
      temperature: temperature,
      maxTokens: maxTokens,
      configProvided: !!aiConfig,
      configSource
    });

    const ldClient = req.app.locals.ldClient;
    if (ldClient) {
      const headerUserKey = req.headers['x-user-key'];
      const resolvedUserKey = Array.isArray(headerUserKey) ? headerUserKey[0] : headerUserKey;
      const eventContext = {
        kind: 'user',
        key: String(resolvedUserKey || req.ip || 'anonymous-chat-user')
      };

      ldClient.track('chatbot-ai-config-applied', eventContext, {
        configKey: ldAIConfigKey,
        configSource,
        model: modelName,
        temperature,
        maxTokens
      });
      ldClient.flush();
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{
            text: `${systemPrompt}\n\nHere's the user's question: ${message}`
          }]
        }
      ],
      generationConfig: {
        temperature: temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      }
    };

    const invokeGemini = async () => {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini request failed with status ${response.status}`);
      }

      return response.json();
    };

    const mapGeminiMetrics = (result) => {
      const usage = result?.usageMetadata || {};
      return {
        success: true,
        usage: {
          total: Number(usage.totalTokenCount || 0),
          input: Number(usage.promptTokenCount || 0),
          output: Number(usage.candidatesTokenCount || 0)
        }
      };
    };

    const configTracker = configSource === 'launchdarkly-ai-sdk'
      ? resolvedConfig?.tracker
      : null;
    const data = configTracker && typeof configTracker.trackMetricsOf === 'function'
      ? await configTracker.trackMetricsOf(mapGeminiMetrics, invokeGemini)
      : await invokeGemini();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      res.json({
        response: aiResponse,
        configSource,
        checkedAIConfigKey: ldAIConfigKey || null,
        appliedAIConfig: {
          model: modelName,
          temperature,
          maxTokens,
          enabled: resolvedConfig.enabled
        },
        sdkResolution
      });
    } else {
      if (configTracker && typeof configTracker.trackError === 'function') {
        configTracker.trackError();
      }
      res.status(500).json({ error: 'Unexpected response format from AI' });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
